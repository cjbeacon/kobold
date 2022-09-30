import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	CommandInteraction,
	PermissionString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';
import {
	findPossibleSaveFromString,
	getActiveCharacter,
	getBestNameMatch,
} from '../../../utils/character-utils.js';
import { buildDiceExpression, RollBuilder } from '../../../utils/dice-utils.js';

export class RollSaveSubCommand implements Command {
	public names = ['save'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'save',
		description: `rolls a save for your active character`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<void> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SAVE_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SAVE_CHOICE_OPTION.name);

			//get the active character
			const activeCharacter = await getActiveCharacter(intr.user.id);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				InteractionUtils.respond(intr, []);
				return;
			}
			//find a save on the character matching the autocomplete string
			const matchedSaves = findPossibleSaveFromString(activeCharacter, match).map(save => ({
				name: save.Name,
				value: save.Name,
			}));
			//return the matched saves
			InteractionUtils.respond(intr, matchedSaves);
		}
	}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const saveChoice = intr.options.getString(ChatArgs.SAVE_CHOICE_OPTION.name);
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const activeCharacter = await getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}

		//use the first save that matches the text of what we were sent, or preferably a perfect match
		let targetSave = getBestNameMatch(
			saveChoice,
			activeCharacter.calculatedStats.totalSaves as WG.NamedBonus[]
		);

		const rollBuilder = new RollBuilder({
			actorName: intr.user.username,
			character: activeCharacter,
			rollNote,
			rollDescription: `rolled ${targetSave.Name}`,
		});
		rollBuilder.addRoll(
			buildDiceExpression('d20', String(targetSave.Bonus), modifierExpression)
		);
		const response = rollBuilder.compileEmbed();

		await InteractionUtils.send(intr, response);
	}
}