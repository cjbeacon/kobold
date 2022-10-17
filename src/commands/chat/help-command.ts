import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionsString,
} from 'discord.js';

import { ChatArgs } from '../../constants/index.js';
import { HelpOption } from '../../enums/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class HelpCommand implements Command {
	public names = ['help'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'help',
		name_localizations: Lang.getRefLocalizationMap('chatCommands.help'),
		description: Lang.getRef('commandDescs.help', Language.Default),
		description_localizations: Lang.getRefLocalizationMap('commandDescs.help'),
		dm_permission: true,
		default_member_permissions: undefined,
		options: [
			{
				...ChatArgs.HELP_OPTION,
				required: true,
			},
		],
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];
	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		let option = intr.options.getString(Lang.getRef('arguments.option', Language.Default));

		let embed: EmbedBuilder;
		switch (option) {
			case HelpOption.COMMANDS: {
				embed = Lang.getEmbed('displayEmbeds.commands', data.lang());
				break;
			}
			case HelpOption.PERMISSIONS: {
				embed = Lang.getEmbed('displayEmbeds.permissions', data.lang());
				break;
			}
			case HelpOption.FAQ: {
				embed = Lang.getEmbed('displayEmbeds.faq', data.lang());
				break;
			}
			default: {
				return;
			}
		}

		await InteractionUtils.send(intr, embed);
	}
}
