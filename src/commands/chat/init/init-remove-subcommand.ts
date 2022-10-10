import { InitiativeActorGroup } from './../../../services/kobold/models/initiative-actor-group/initiative-actor-group.model';
import { InitiativeActor } from '../../../services/kobold/models/initiative-actor/initiative-actor.model';
import { ChatArgs } from '../../../constants/chat-args';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	EmbedBuilder,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative } from '../../../services/kobold/models/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

export class InitRemoveSubCommand implements Command {
	public names = ['remove'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'remove',
		description: `Remove a character from the Initiative`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

			const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
			if (!currentInitResponse) await InteractionUtils.respond(intr, []);
			//get the character matches
			let actorOptions = InitiativeUtils.getControllableInitiativeActors(
				currentInitResponse.init,
				intr.user.id
			);
			actorOptions = actorOptions.filter(actor => actor.name.includes(match));

			//return the matched skills
			return actorOptions.map(actor => ({
				name: actor.name,
				value: actor.name,
			}));
		}
	}

	public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
		const targetCharacterName = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;

		let actorResponse: { actor: InitiativeActor; errorMessage: string };
		if (!targetCharacterName) {
			actorResponse = await InitiativeUtils.getActiveCharacterActor(
				currentInit,
				intr.user.id
			);
		} else {
			actorResponse = await InitiativeUtils.getNameMatchActorFromInitiative(
				intr.user.id,
				currentInit,
				targetCharacterName
			);
		}
		if (actorResponse.errorMessage) {
			await InteractionUtils.send(intr, actorResponse.errorMessage);
			return;
		}
		const actor = actorResponse.actor;
		const actorsInGroup = _.filter(
			currentInit.actors,
			possibleActor => possibleActor.initiativeActorGroupId === actor.initiativeActorGroupId
		);
		await InitiativeActor.query().deleteById(actor.id);
		if (actorsInGroup.length === 1) {
			await InitiativeActorGroup.query().deleteById(actor.initiativeActorGroupId);
		}

		const deletedEmbed = new KoboldEmbed();
		deletedEmbed.setTitle(`Yip! ${actor.name} was removed from initiative.`);

		const targetMessageId = currentInit.roundMessageIds[currentInit.currentRound || 0];
		if (targetMessageId) {
			const targetMessage = await intr.channel.messages.fetch(targetMessageId);
			deletedEmbed.addFields([
				{ name: '\u200B', value: `[View Current Round](${targetMessage.url})` },
			]);
		}
		await InteractionUtils.send(intr, deletedEmbed);

		if (
			//we removed the currently active group
			currentInit.currentTurnGroupId === actor.initiativeActorGroupId &&
			//the groups are not already empty somehow
			currentInit.actorGroups?.length &&
			//we haven't removed the last group
			!(currentInit.actorGroups.length === 1 && actorsInGroup.length === 1)
		) {
			//we need to fix the initiative!

			const initBuilder = new InitiativeBuilder({ initiative: currentInit });
			let previousTurn = initBuilder.getPreviousTurnChanges();
			if (previousTurn.errorMessage) {
				previousTurn = initBuilder.getNextTurnChanges();
			}

			const updatedInitiative = await Initiative.query()
				.updateAndFetchById(currentInit.id, previousTurn)
				.withGraphFetched('[actors.[character], actorGroups]');

			initBuilder.set({
				initiative: updatedInitiative,
				actors: updatedInitiative.actors,
				groups: updatedInitiative.actorGroups,
			});

			const currentRoundMessage = await initBuilder.getCurrentRoundMessage(intr);
			const url = currentRoundMessage ? currentRoundMessage.url : '';
			const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder, url);
			const activeGroup = initBuilder.activeGroup;

			await InitiativeUtils.updateInitiativeRoundMessageOrSendNew(intr, initBuilder);

			await InteractionUtils.send(intr, {
				content: `<@${activeGroup.userId}>`,
				embeds: [currentTurnEmbed],
			});
		} else {
			const initBuilder = new InitiativeBuilder({
				initiative: currentInit,
			});
			initBuilder.removeActor(actor);
			await InitiativeUtils.updateInitiativeRoundMessageOrSendNew(intr, initBuilder);
		}
	}
}
