/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A character or monster sheet.
 */
export interface Sheet {
	/**
	 * The general character sheet formation.
	 */
	info?: {
		/**
		 * The character's name.
		 */
		name?: string;
		/**
		 * The url to open the character.
		 */
		url?: string | null;
		/**
		 * The character's description.
		 */
		description?: string | null;
		/**
		 * The character's gender
		 */
		gender?: string | null;
		/**
		 * The character's age
		 */
		age?: number | null;
		/**
		 * The character's alignment
		 */
		alignment?: string | null;
		/**
		 * The character's deity
		 */
		deity?: string | null;
		/**
		 * The character's portrait image URL.
		 */
		imageURL?: string | null;
		/**
		 * The character's level.
		 */
		level?: number | null;
		/**
		 * The character's size category.
		 */
		size?: string | null;
		/**
		 * The character's class.
		 */
		class?: string | null;
		/**
		 * The character's key ability.
		 */
		keyability?: string | null;
		/**
		 * The character's ancestry.
		 */
		ancestry?: string | null;
		/**
		 * The character's heritage.
		 */
		heritage?: string | null;
		/**
		 * The character's background.
		 */
		background?: string | null;
		/**
		 * The character's traits.
		 */
		traits?: (string | null)[];
		/**
		 * Whether the character follows alternate stamina rules.
		 */
		usesStamina?: boolean;
		[k: string]: any;
	};
	/**
	 * The character's primary ability scores.
	 */
	abilities?: {
		/**
		 * The character's strength score.
		 */
		strength?: number | null;
		/**
		 * The character's dexterity score.
		 */
		dexterity?: number | null;
		/**
		 * The character's constitution score.
		 */
		constitution?: number | null;
		/**
		 * The character's intelligence score.
		 */
		intelligence?: number | null;
		/**
		 * The character's wisdom score.
		 */
		wisdom?: number | null;
		/**
		 * The character's charisma score.
		 */
		charisma?: number | null;
		[k: string]: any;
	};
	/**
	 * The general attributes for the character.
	 */
	general?: {
		/**
		 * The character's current hero points.
		 */
		currentHeroPoints?: number | null;
		/**
		 * The character's land speed.
		 */
		speed?: number | null;
		/**
		 * The character's fly speed.
		 */
		flySpeed?: number | null;
		/**
		 * The character's swim speed.
		 */
		swimSpeed?: number | null;
		/**
		 * The character's climb speed.
		 */
		climbSpeed?: number | null;
		/**
		 * The character's current focus points.
		 */
		currentFocusPoints?: number | null;
		/**
		 * The character's maximum focus points.
		 */
		focusPoints?: number | null;
		/**
		 * The character's class DC.
		 */
		classDC?: number | null;
		/**
		 * The character's perception.
		 */
		perception?: number | null;
		/**
		 * The character's perception proficiency modifier.
		 */
		perceptionProfMod?: number | null;
		/**
		 * The character's spoken languages.
		 */
		languages?: (string | null)[];
		/**
		 * The character's senses.
		 */
		senses?: (string | null)[];
		[k: string]: any;
	};
	/**
	 * The character defensive attributes.
	 */
	defenses?: {
		/**
		 * The character's current hit points.
		 */
		currentHp?: number | null;
		/**
		 * The character's maximum hit points.
		 */
		maxHp?: number | null;
		/**
		 * The character's temporary hit points.
		 */
		tempHp?: number | null;
		/**
		 * The character's current resolve points.
		 */
		currentResolve?: number | null;
		/**
		 * The character's maximum resolve points.
		 */
		maxResolve?: number | null;
		/**
		 * The character's current stamina points.
		 */
		currentStamina?: number | null;
		/**
		 * The character's maximum stamina points.
		 */
		maxStamina?: number | null;
		/**
		 * The character's immunities.
		 */
		immunities?: (string | null)[];
		/**
		 * The character's resistances.
		 */
		resistances?: {
			/**
			 * the amount of resistance for this type of damage
			 */
			amount?: number | null;
			/**
			 * the damage type that's resisted
			 */
			type?: string | null;
			[k: string]: any;
		}[];
		/**
		 * The character's weaknesses.
		 */
		weaknesses?: {
			/**
			 * the amount of weakness for this type of damage
			 */
			amount?: number | null;
			/**
			 * the damage type that of the weakness
			 */
			type?: string | null;
			[k: string]: any;
		}[];
		/**
		 * The character's armor class
		 */
		ac?: number | null;
		/**
		 * The character's heavy armor proficiency modifier.
		 */
		heavyProfMod?: number | null;
		/**
		 * The character's medium armor proficiency modifier.
		 */
		mediumProfMod?: number | null;
		/**
		 * The character's light armor proficiency modifier.
		 */
		lightProfMod?: number | null;
		/**
		 * The character's unarmored proficiency modifier.
		 */
		unarmoredProfMod?: number | null;
		[k: string]: any;
	};
	/**
	 * The character's offensive attributes.
	 */
	offense?: {
		/**
		 * The character's martial weapon proficiency modifier.
		 */
		martialProfMod?: number | null;
		/**
		 * The character's simple weapon proficiency modifier.
		 */
		simpleProfMod?: number | null;
		/**
		 * The character's unarmed weapon proficiency modifier.
		 */
		unarmedProfMod?: number | null;
		/**
		 * The character's advanced weapon proficiency modifier.
		 */
		advancedProfMod?: number | null;
		[k: string]: any;
	};
	/**
	 * The character's casting stats.
	 */
	castingStats?: {
		/**
		 * The character's arcane casting attack bonus.
		 */
		arcaneAttack?: number | null;
		/**
		 * The character's arcane casting DC.
		 */
		arcaneDC?: number | null;
		/**
		 * The character's arcane casting proficiency modifier.
		 */
		arcaneProfMod?: number | null;
		/**
		 * The character's divine casting stat.
		 */
		divineAttack?: number | null;
		/**
		 * The character's divine casting stat.
		 */
		divineDC?: number | null;
		/**
		 * The character's divine casting proficiency modifier.
		 */
		divineProfMod?: number | null;
		/**
		 * The character's occult casting stat.
		 */
		occultAttack?: number | null;
		/**
		 * The character's occult casting stat.
		 */
		occultDC?: number | null;
		/**
		 * The character's occult casting proficiency modifier.
		 */
		occultProfMod?: number | null;
		/**
		 * The character's primal casting stat.
		 */
		primalAttack?: number | null;
		/**
		 * The character's primal casting stat.
		 */
		primalDC?: number | null;
		/**
		 * The character's primal casting proficiency modifier.
		 */
		primalProfMod?: number | null;
		[k: string]: any;
	};
	/**
	 * The character's saving throw attributes.
	 */
	saves?: {
		/**
		 * The character's fortitude save.
		 */
		fortitude?: number | null;
		/**
		 * The character's fortitude proficiency modifier.
		 */
		fortitudeProfMod?: number | null;
		/**
		 * The character's reflex save.
		 */
		reflex?: number | null;
		/**
		 * The character's reflex proficiency modifier.
		 */
		reflexProfMod?: number | null;
		/**
		 * The character's will save.
		 */
		will?: number | null;
		/**
		 * The character's will proficiency modifier.
		 */
		willProfMod?: number | null;
		[k: string]: any;
	};
	/**
	 * The character's skill attributes.
	 */
	skills?: {
		/**
		 * The character's acrobatics skill.
		 */
		acrobatics?: number | null;
		/**
		 * The character's acrobatics proficiency modifier.
		 */
		acrobaticsProfMod?: number | null;
		/**
		 * The character's arcana skill.
		 */
		arcana?: number | null;
		/**
		 * The character's arcana proficiency modifier.
		 */
		arcanaProfMod?: number | null;
		/**
		 * The character's athletics skill.
		 */
		athletics?: number | null;
		/**
		 * The character's athletics proficiency modifier.
		 */
		athleticsProfMod?: number | null;
		/**
		 * The character's crafting skill.
		 */
		crafting?: number | null;
		/**
		 * The character's crafting proficiency modifier.
		 */
		craftingProfMod?: number | null;
		/**
		 * The character's deception skill.
		 */
		deception?: number | null;
		/**
		 * The character's deception proficiency modifier.
		 */
		deceptionProfMod?: number | null;
		/**
		 * The character's diplomacy skill.
		 */
		diplomacy?: number | null;
		/**
		 * The character's diplomacy proficiency modifier.
		 */
		diplomacyProfMod?: number | null;
		/**
		 * The character's intimidation skill.
		 */
		intimidation?: number | null;
		/**
		 * The character's intimidation proficiency modifier.
		 */
		intimidationProfMod?: number | null;
		/**
		 * The character's medicine skill.
		 */
		medicine?: number | null;
		/**
		 * The character's medicine proficiency modifier.
		 */
		medicineProfMod?: number | null;
		/**
		 * The character's nature skill.
		 */
		nature?: number | null;
		/**
		 * The character's nature proficiency modifier.
		 */
		natureProfMod?: number | null;
		/**
		 * The character's occultism skill.
		 */
		occultism?: number | null;
		/**
		 * The character's occultism proficiency modifier.
		 */
		occultismProfMod?: number | null;
		/**
		 * The character's performance skill.
		 */
		performance?: number | null;
		/**
		 * The character's performance proficiency modifier.
		 */
		performanceProfMod?: number | null;
		/**
		 * The character's religion skill.
		 */
		religion?: number | null;
		/**
		 * The character's religion proficiency modifier.
		 */
		religionProfMod?: number | null;
		/**
		 * The character's society skill.
		 */
		society?: number | null;
		/**
		 * The character's society proficiency modifier.
		 */
		societyProfMod?: number | null;
		/**
		 * The character's stealth skill.
		 */
		stealth?: number | null;
		/**
		 * The character's stealth proficiency modifier.
		 */
		stealthProfMod?: number | null;
		/**
		 * The character's survival skill.
		 */
		survival?: number | null;
		/**
		 * The character's survival proficiency modifier.
		 */
		survivalProfMod?: number | null;
		/**
		 * The character's thievery skill.
		 */
		thievery?: number | null;
		/**
		 * The character's thievery proficiency modifier.
		 */
		thieveryProfMod?: number | null;
		/**
		 * The character's lore skills.
		 */
		lores?: {
			/**
			 * The lore name.
			 */
			name?: string | null;
			/**
			 * The lore bonus.
			 */
			bonus?: number | null;
			/**
			 * The lore proficiencyModifer.
			 */
			profMod?: number | null;
			[k: string]: any;
		}[];
		[k: string]: any;
	};
	/**
	 * The character's attacks.
	 */
	attacks?: {
		/**
		 * The attack name.
		 */
		name?: string | null;
		/**
		 * The attack toHit.
		 */
		toHit?: number | null;
		/**
		 * The attack damage.
		 */
		damage?: {
			/**
			 * The attack damage dice.
			 */
			dice?: string | null;
			/**
			 * The attack damage type.
			 */
			type?: string | null;
			[k: string]: any;
		}[];
		/**
		 * The attack range.
		 */
		range?: string | null;
		/**
		 * The attack traits.
		 */
		traits?: (string | null)[];
		/**
		 * The attack notes.
		 */
		notes?: string | null;
		[k: string]: any;
	}[];
	/**
	 * The source data the sheet was parsed from
	 */
	sourceData?: {
		[k: string]: any;
	};
	/**
	 * An array of toggleable modifier objects that apply dice expression values to rolls with certain tags.
	 */
	modifiers?: {
		name?: string | null;
		isActive?: boolean;
		description?: string | null;
		type?: string | null;
		targetTags?: string | null;
		value?: number | string;
		[k: string]: any;
	}[];
	/**
	 * An array of default actions set up for the user. These allow the user to make certain roll operations as a single command.
	 */
	actions?: {
		name?: string | null;
		description?: string | null;
		type?: string | null;
		actionCost?: string | null;
		baseLevel?: number | null;
		autoHeighten?: boolean;
		tags?: (string | null)[];
		rolls?: (
			| {
					name?: string | null;
					type?: "attack" | null;
					targetDC?: string | null;
					roll?: string | null;
					allowRollModifiers?: boolean;
					[k: string]: any;
			  }
			| {
					name?: string | null;
					type?: "damage" | null;
					roll?: string | null;
					allowRollModifiers?: boolean;
					[k: string]: any;
			  }
			| {
					name?: string | null;
					type?: "advanced-damage" | null;
					criticalSuccessRoll?: string | null;
					criticalFailureRoll?: string | null;
					successRoll?: string | null;
					failureRoll?: string | null;
					allowRollModifiers?: boolean;
					[k: string]: any;
			  }
			| {
					name?: string | null;
					type?: "save" | null;
					saveRollType?: string | null;
					saveTargetDC?: string | null;
					allowRollModifiers?: boolean;
					[k: string]: any;
			  }
			| {
					name?: string | null;
					type?: "text" | null;
					defaultText?: string | null;
					criticalSuccessText?: string | null;
					criticalFailureText?: string | null;
					successText?: string | null;
					failureText?: string | null;
					allowRollModifiers?: boolean;
					extraTags?: (string | null)[];
					[k: string]: any;
			  }
		)[];
		[k: string]: any;
	}[];
	/**
	 * An array of roll macro objects that allow the substituting of saved roll expressions for simple keywords.
	 */
	rollMacros?: {
		name?: string | null;
		macro?: string | null;
		[k: string]: any;
	}[];
	[k: string]: any;
}