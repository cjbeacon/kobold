import { buildDiceExpression, RollBuilder } from '../../../utils/dice-utils';
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
	findPossibleAbilityFromString,
	getActiveCharacter,
	getBestNameMatch,
} from '../../../utils/character-utils.js';

export class RollAbilitySubCommand implements Command {
	public names = ['ability'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'ability',
		description: `rolls an ability for your active character`,
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
		if (option.name === ChatArgs.ABILITY_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.ABILITY_CHOICE_OPTION.name);

			//get the active character
			const activeCharacter = await getActiveCharacter(intr.user.id);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				InteractionUtils.respond(intr, []);
				return;
			}
			//find a ability on the character matching the autocomplete string
			const matchedAbilitys = findPossibleAbilityFromString(activeCharacter, match).map(
				ability => ({
					name: ability.Name,
					value: ability.Name,
				})
			);
			//return the matched abilitys
			InteractionUtils.respond(intr, matchedAbilitys);
		}
	}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const abilityChoice = intr.options.getString(ChatArgs.ABILITY_CHOICE_OPTION.name);
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const activeCharacter = await getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}

		//use the first ability that matches the text of what we were sent, or preferably a perfect match
		let targetAbility = getBestNameMatch(
			abilityChoice,
			activeCharacter.calculatedStats.totalAbilityScores as WG.NamedScore[]
		);

		// allow the modifier to only optionally start with +/- by wrapping it with +()
		// because +(+1) is valid, but ++1 is not
		let wrappedModifierExpression = '';
		if (modifierExpression) wrappedModifierExpression = `+(${modifierExpression})`;
		const diceExpression = `1d20+${targetAbility.Score || 0}${wrappedModifierExpression}`;

		const rollBuilder = new RollBuilder({
			character: activeCharacter,
			rollNote,
			rollDescription: `rolled ${targetAbility.Name}`,
		});
		rollBuilder.addRoll(
			buildDiceExpression('d20', String(targetAbility.Score), modifierExpression)
		);
		const response = rollBuilder.compileEmbed();

		await InteractionUtils.send(intr, response);
	}
}