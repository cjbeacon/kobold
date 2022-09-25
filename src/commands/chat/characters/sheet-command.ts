import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString, MessageEmbed } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import type { WG } from '../../../services/wanderers-guide/wanderers-guide.js';

export class SheetCommand implements Command {
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'sheet',
		description: `displays the active character's sheet`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		//check if we have a token
		const existingCharacter = await Character.query().where({
			isActiveCharacter: true,
			userId: intr.user.id,
		});

		if (existingCharacter.length) {
			const character = existingCharacter[0];
			const characterData = character.characterData as WG.CharacterApiResponse;
			const calculatedStats =
				character.calculatedStats as WG.CharacterCalculatedStatsApiResponse;

			const imageUrl = characterData.infoJSON?.imageURL || '';
			const characterUrl = `https://wanderersguide.app/profile/characters/${characterData.id}`;
			const level = characterData.level;
			const heritage = [characterData.vHeritageName, characterData.heritageName]
				.join(' ')
				.trim();
			const ancestry = characterData.ancestryName;
			const classes = [characterData.className, characterData.className2].join(' ').trim();

			let messageEmbed = new MessageEmbed().setTitle(characterData.name).setURL(characterUrl);

			if (imageUrl) {
				messageEmbed = messageEmbed.setThumbnail(imageUrl);
			}

			let maxHpText = String(calculatedStats.maxHP);
			if (maxHpText === 'null') maxHpText = 'none';
			let totalACText = String(calculatedStats.totalAC);
			if (totalACText === 'null') totalACText = 'none';
			let totalPerceptionText = String(calculatedStats.totalPerception);
			if (totalPerceptionText === 'null') totalPerceptionText = 'none';
			else if (calculatedStats.totalPerception >= 0)
				totalPerceptionText = `+${totalPerceptionText}`;
			else totalPerceptionText = `${totalPerceptionText}`;
			let totalClassDCText = String(calculatedStats.totalClassDC);
			if (totalClassDCText === 'null') totalClassDCText = 'none';
			let totalSpeedText = String(calculatedStats.totalSpeed);
			if (totalSpeedText === 'null') totalSpeedText = 'none';

			messageEmbed.addFields([
				{
					name: `Level ${level} ${heritage} ${ancestry} ${classes}\n`,
					value:
						`Max HP \`${maxHpText}\`\n` +
						`AC \`${totalACText}\`\n` +
						`Perception \`${totalPerceptionText}\` (DC ${
							10 + (calculatedStats.totalPerception || 0)
						})\n` +
						`${classes} DC \`${totalClassDCText}\`\n` +
						`Speed \`${totalSpeedText}\`\n\n` +
						`Background: ${characterData.backgroundName || 'none'}`,
				},
			]);
			const abilitiesText = calculatedStats.totalAbilityScores
				.map(ability => {
					const symbol = ability.Score >= 0 ? '+' : '';
					return `${ability.Name.substring(0, 3)} \`${symbol}${ability.Score}\``;
				})
				.join(', ');
			const abilitiesEmbed = {
				name: 'Abilities',
				value: abilitiesText,
				inline: false,
			};
			const savesText = calculatedStats.totalSaves
				.map(save => {
					const symbol = save.Bonus >= 0 ? '+' : '';
					return `${save.Name} \`${symbol}${save.Bonus}\` (DC ${10 + save.Bonus})`;
				})
				.join(', ');
			const savesEmbed = {
				name: 'Saves',
				value: savesText,
				inline: false,
			};
			const skillAndSaveEmbeds = [];
			if (abilitiesText) skillAndSaveEmbeds.push(abilitiesEmbed);
			if (savesText) skillAndSaveEmbeds.push(savesEmbed);

			messageEmbed.addFields(skillAndSaveEmbeds);

			const thirdSkillsArr = calculatedStats.totalSkills.map(skill => {
				const symbol = skill.Bonus >= 0 ? '+' : '';
				return `${skill.Name} \`${symbol}${skill.Bonus}\``;
			});
			const skillsPerField = Math.ceil(thirdSkillsArr.length / 3);
			const firstSkillsArr = thirdSkillsArr.splice(0, skillsPerField);
			const secondSkillsArr = thirdSkillsArr.splice(0, skillsPerField);
			const skillFields = [];
			if (firstSkillsArr.length)
				skillFields.push({
					name: 'Skills',
					value: firstSkillsArr.join('\n'),
					inline: true,
				});
			if (secondSkillsArr.length)
				skillFields.push({
					name: 'Skills',
					value: secondSkillsArr.join('\n'),
					inline: true,
				});
			if (thirdSkillsArr.length)
				skillFields.push({
					name: 'Skills',
					value: thirdSkillsArr.join('\n'),
					inline: true,
				});
			if (skillFields.length) messageEmbed.addFields(skillFields);

			await InteractionUtils.send(intr, messageEmbed);
		} else {
			// the user needs to import a character!
			await InteractionUtils.send(
				intr,
				`Yip! I can't find an active character. /import a character before you can look at its sheet.`
			);
		}
	}
}