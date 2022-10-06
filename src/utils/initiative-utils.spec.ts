import {
	InitiativeFactory,
	InitiativeActorFactory,
	InitiativeActorGroupFactory,
	Initiative,
} from '../services/kobold/models/index.js';
import * as initiativeUtils from './initiative-utils.js';
import { CommandInteraction } from 'discord.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import { InteractionUtils } from './interaction-utils.js';

function setupInitiativeActorsAndGroupsForTests(initiative) {
	const actors = InitiativeActorFactory.withFakeId().buildList(
		3,
		{},
		{ transient: { includeGroup: true } }
	);
	const groups = actors.map(actor => actor.actorGroup);
	const firstGroup = groups[2];
	firstGroup.initiativeResult = 30;
	const secondGroup = groups[0];
	secondGroup.initiativeResult = 20;
	const thirdGroup = groups[1];
	thirdGroup.initiativeResult = 10;

	initiative.actors = actors;
	initiative.actorGroups = groups;
	return { actors, groups, firstGroup, secondGroup, thirdGroup };
}

// setup jest tests for each function in ./initiative-utils.ts
describe('initiative-utils', function () {
	describe('InitiativeBuilder', function () {
		test('creates an empty initiative', function () {
			const builder = new initiativeUtils.InitiativeBuilder({});
			expect(builder).toBeDefined();
		});
		test('orders initiative actors by initiative result', function () {
			const initiative = InitiativeFactory.build();
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			secondGroup.initiativeResult = 30;
			thirdGroup.initiativeResult = 20;
			firstGroup.initiativeResult = 10;
			const builder = new initiativeUtils.InitiativeBuilder({ initiative, actors, groups });
			const orderedGroups = builder.groups;
			expect(orderedGroups[0]).toBe(secondGroup);
			expect(orderedGroups[1]).toBe(thirdGroup);
			expect(orderedGroups[2]).toBe(firstGroup);
		});
		describe('getPreviousTurnGroup', function () {
			test('fails to move to the previous turn on the first turn of round 1', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = firstGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getPreviousTurnChanges().errorMessage).toBeDefined();
				expect(builder.getPreviousTurnChanges().currentTurnGroupId).not.toBeDefined();
				expect(builder.getPreviousTurnChanges().currentRound).not.toBeDefined();
			});
			test('fails to move to the previous turn before the initiative has started', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 0,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getPreviousTurnChanges().errorMessage).toBeDefined();
				expect(builder.getPreviousTurnChanges().currentTurnGroupId).not.toBeDefined();
				expect(builder.getPreviousTurnChanges().currentRound).not.toBeDefined();
			});
			test('moves to the previous turn after initiative has started', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = secondGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getPreviousTurnChanges().currentTurnGroupId).toBe(firstGroup.id);
				expect(builder.getPreviousTurnChanges().currentRound).toBe(1);
				expect(builder.getPreviousTurnChanges().errorMessage).not.toBeDefined();
			});
		});
		describe('getNextTurnChanges', function () {
			test('moves to the previous round on the first turn in a subsequent round', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 2,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = firstGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getPreviousTurnChanges().currentRound).toBe(1);
				expect(builder.getPreviousTurnChanges().currentTurnGroupId).toBe(thirdGroup.id);
				expect(builder.getPreviousTurnChanges().errorMessage).not.toBeDefined();
			});
			test('moves to the next turn before initiative has started', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getNextTurnChanges().currentTurnGroupId).toBe(firstGroup.id);
				expect(builder.getNextTurnChanges().currentRound).toBe(1);
				expect(builder.getNextTurnChanges().errorMessage).not.toBeDefined();
			});
			test('moves to the next turn after initiative has started', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = secondGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getNextTurnChanges().currentTurnGroupId).toBe(thirdGroup.id);
				expect(builder.getNextTurnChanges().currentRound).toBe(1);
				expect(builder.getNextTurnChanges().errorMessage).not.toBeDefined();
			});
			test('moves to the next round on the last turn in a round', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = thirdGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getNextTurnChanges().currentRound).toBe(2);
				expect(builder.getNextTurnChanges().currentTurnGroupId).toBe(firstGroup.id);
				expect(builder.getNextTurnChanges().errorMessage).not.toBeDefined();
			});
		});
		describe('removeActor', function () {
			test('does nothing when the actor is not in the initiative', async function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				const turn = await KoboldEmbed.roundFromInitiativeBuilder(builder).toJSON();

				builder.removeActor(InitiativeActorFactory.build());

				const updatedTurn = await KoboldEmbed.roundFromInitiativeBuilder(builder).toJSON();
				expect(turn).toMatchObject(updatedTurn);
			});
			test('removes an actor from the initiative', async function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				builder.removeActor(actors[0]);

				expect(builder.actorsByGroup[actors[0].initiativeActorGroupId] || []).not.toContain(
					actors[0]
				);
				expect(
					builder.groups.find(group => group.id === actors[0].initiativeActorGroupId)
				).toBeFalsy();
			});
			test("Doesn't update the current turn", function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = actors[0].initiativeActorGroupId;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				builder.removeActor(actors[0]);

				expect(builder.init.currentRound).toBe(1);
				expect(builder.init.currentTurnGroupId).toBe(actors[0].initiativeActorGroupId);
			});
		});
		describe('getActorGroupTurnText', function () {
			test('returns the text for a group with one actor', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getActorGroupTurnText(firstGroup)).toContain(firstGroup.name);
				expect(builder.getActorGroupTurnText(firstGroup)).toContain(
					firstGroup.initiativeResult + ''
				);
			});
			test('returns the text for a group with multiple actors', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				actors[1].initiativeActorGroupId = secondGroup.id;
				actors[2].initiativeActorGroupId = secondGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				const turnText = builder.getActorGroupTurnText(secondGroup);
				expect(turnText).toContain(secondGroup.name);
				expect(turnText).toContain(secondGroup.initiativeResult + '');
				expect(turnText).toContain(actors[1].name);
				expect(turnText).toContain(actors[2].name);
			});
			test('still returns a result for a group with no actors', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				const extraGroup = InitiativeActorGroupFactory.build();
				expect(builder.getActorGroupTurnText(extraGroup)).toContain(extraGroup.name);
			});
		});
		describe('activeGroup', function () {
			test('returns the active group', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = firstGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				expect(builder.activeGroup).toBe(firstGroup);
			});
			test('returns a falsy value if there is no active group', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				expect(builder.activeGroup).toBeFalsy();
			});
		});
		describe('getCurrentRoundMessage', function () {
			test('returns the current round message', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				initiative.roundMessageIds = ['first', 'second', 'third'];
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				const fakeIntr = {
					channel: {
						messages: {
							fetch(targetMessageId) {
								return 'success! ' + targetMessageId;
							},
						},
					},
				};
				expect(
					builder.getCurrentRoundMessage(fakeIntr as any as CommandInteraction)
				).resolves.toContain('success! ' + 'second');
			});
			test('returns null if there is no current round message', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				initiative.roundMessageIds = [];
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				const fakeIntr = {};
				expect(
					builder.getCurrentRoundMessage(fakeIntr as any as CommandInteraction)
				).resolves.toBeNull();
			});
		});
	});
	describe('getInitiativeForChannel', function () {
		beforeAll(async function () {
			await Initiative.query().delete().where({ channelId: 'testChannelId' });
			return await InitiativeFactory.create({ channelId: 'testChannelId' });
		});
		test('returns the initiative for the channel', async function () {
			const result = await initiativeUtils.getInitiativeForChannel({
				id: 'testChannelId',
			} as any);
			expect(result).toBeTruthy();
		});
		test('returns null if there is no initiative for the channel', async function () {
			const result = await initiativeUtils.getInitiativeForChannel({
				id: 'nonexistentChannelId',
			} as any);
			expect(result.errorMessage).toBeTruthy();
		});
		test('returns an error message if a channel is not provided', async function () {
			const result = await initiativeUtils.getInitiativeForChannel(null as any);
			expect(result.errorMessage).toBeTruthy();
		});
		afterAll(async function () {
			await Initiative.query().delete().where({ channelId: 'testChannelId' });
		});
	});
	describe('updateInitiativeRoundMessageOrSendNew', function () {
		test('updates the initiative round message if it exists', async function () {
			const initiative = await InitiativeFactory.create({
				roundMessageIds: ['first', 'second', 'third'],
				currentRound: 2,
			});

			const fakeIntr = {
				channel: {
					messages: {
						fetch(targetMessageId) {
							return {
								edit(content) {
									return Promise.resolve(content);
								},
								val: 'success! ' + targetMessageId,
							};
						},
					},
				},
			};
			const result: any = await initiativeUtils.updateInitiativeRoundMessageOrSendNew(
				fakeIntr as any as CommandInteraction,
				new initiativeUtils.InitiativeBuilder({ initiative })
			);
			expect(result.val).toBe('success! third');
		});
		test('sends a new initiative round message if it does not exist', async function () {
			const initiative = await InitiativeFactory.create({
				roundMessageIds: [],
				currentRound: 0,
			});
			const fakeIntr = {
				channel: {
					send(content) {
						return 'success! ' + content;
					},
				},
			};
			jest.spyOn(InteractionUtils, 'send').mockResolvedValueOnce('success!' as any);
			jest.spyOn(Initiative, 'query').mockImplementationOnce((): any => {
				return {
					updateAndFetchById(id, obj) {
						return initiative;
					},
				};
			});
			const result = await initiativeUtils.updateInitiativeRoundMessageOrSendNew(
				fakeIntr as any as CommandInteraction,
				new initiativeUtils.InitiativeBuilder({ initiative })
			);
			expect(result).toBe('success!');
		});
	});
	describe('getControllableInitiativeActors', function () {
		test('returns all controllable actors', async function () {
			const initiative = await InitiativeFactory.create({ gmUserId: 'testGmUserId' });
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			actors[0].userId = 'testUserId';
			actors[1].userId = 'anotherUserId';
			actors[2].userId = 'testUserId';

			const result = initiativeUtils.getControllableInitiativeActors(
				initiative,
				'testUserId'
			);
			expect(result).toHaveLength(2);
		});
		test('returns all initiative actors if the user created the initiative', function () {
			const initiative = InitiativeFactory.build({
				gmUserId: 'testUserId',
			});
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			actors[0].userId = 'testUserId';
			actors[1].userId = 'anotherUserId';

			const result = initiativeUtils.getControllableInitiativeActors(
				initiative,
				'testUserId'
			);
			expect(result).toHaveLength(3);
		});
	});
	describe('getControllableInitiativeGroups', function () {
		test('returns all controllable initiative groups', async function () {
			const initiative = await InitiativeFactory.create({ gmUserId: 'testGmUserId' });
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			firstGroup.userId = 'testUserId';
			secondGroup.userId = 'anotherUserId';
			thirdGroup.userId = 'testUserId';

			const result = initiativeUtils.getControllableInitiativeGroups(
				initiative,
				'testUserId'
			);
			expect(result).toHaveLength(2);
		});
		test('returns all initiative groups if the user created the initiative', function () {
			const initiative = InitiativeFactory.build({
				gmUserId: 'testUserId',
			});
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			firstGroup.userId = 'testUserId';
			secondGroup.userId = 'anotherUserId';

			const result = initiativeUtils.getControllableInitiativeGroups(
				initiative,
				'testUserId'
			);
			expect(result).toHaveLength(3);
		});
	});
	describe('getActiveCharacterActor', function () {
		test('returns the active character actor', function () {
			const initiative = InitiativeFactory.build();
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			actors[0].character = {
				userId: 'anotherUserId',
				isActiveCharacter: true,
			} as any;
			actors[1].character = {
				userId: 'testUserId',
				isActiveCharacter: false,
			} as any;
			actors[2].character = {
				userId: 'testUserId',
				isActiveCharacter: true,
			} as any;

			const result = initiativeUtils.getActiveCharacterActor(initiative, 'testUserId');
			expect(result.actor).toBe(actors[2]);
		});
		test('returns an error message if the user does not have an active character', function () {
			const initiative = InitiativeFactory.build();
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			actors[0].character = {
				userId: 'anotherUserId',
				isActiveCharacter: true,
			} as any;
			actors[1].character = {
				userId: 'testUserId',
				isActiveCharacter: false,
			} as any;
			actors[2].character = {
				userId: 'testUserId',
				isActiveCharacter: false,
			} as any;

			const result = initiativeUtils.getActiveCharacterActor(initiative, 'testUserId');
			expect(result.errorMessage).toBeTruthy();
		});
	});
	describe('nameMatchGeneric', function () {
		// test a function that takes an array of objects with a name property, and finds
		// the closest match to a given name. It also takes a parameter for the error if no choices
		// are found
		test('returns the closest match', function () {
			const names = [
				{ name: 'testName' },
				{ name: 'anotherName' },
				{ name: 'yetAnotherName' },
			];
			const result = initiativeUtils.nameMatchGeneric(names, 'another', '');
			expect(result.value).toBe(names[1]);
		});
		test('returns an error message if no match is found', function () {
			const names = [];
			const result = initiativeUtils.nameMatchGeneric(names, 'notFound', 'error');
			expect(result.errorMessage).toBe('error');
		});
	});
	describe('getNameMatchActorFromInitiative', function () {
		test('returns the closest match', function () {
			const initiative = InitiativeFactory.build();
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			actors[0].name = 'testName';
			actors[0].userId = 'anotherUserId';
			actors[1].name = 'anotherName';
			actors[1].userId = 'testUserId';
			actors[2].name = 'yetAnotherName';
			actors[2].userId = 'testUserId';

			const result = initiativeUtils.getNameMatchActorFromInitiative(
				'testUserId',
				initiative,
				'another'
			);
			expect(result.actor).toBe(actors[1]);
		});
		test('returns an error message if no match is found', function () {
			const initiative = InitiativeFactory.build();
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			initiative.actors = [];

			const result = initiativeUtils.getNameMatchActorFromInitiative(
				'testUserId',
				initiative,
				'notFound'
			);
			expect(result.errorMessage).toBeTruthy();
		});
	});
	describe('getNameMatchGroupFromInitiative', function () {
		test('returns the closest match', function () {
			const initiative = InitiativeFactory.build();
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			firstGroup.name = 'testName';
			firstGroup.userId = 'testUserId';
			secondGroup.name = 'anotherName';
			secondGroup.userId = 'testUserId';
			thirdGroup.name = 'yetAnotherName';
			thirdGroup.userId = 'testUserId';

			const result = initiativeUtils.getNameMatchGroupFromInitiative(
				initiative,
				'testUserId',
				'another'
			);
			expect(result.group).toBe(secondGroup);
		});
		test('returns an error message if no match is found', function () {
			const initiative = InitiativeFactory.build();
			const { actors, groups, firstGroup, secondGroup, thirdGroup } =
				setupInitiativeActorsAndGroupsForTests(initiative);
			firstGroup.name = 'testName';
			firstGroup.userId = 'asdf';
			secondGroup.name = 'anotherName';
			secondGroup.userId = 'qwer';
			thirdGroup.name = 'yetAnotherName';
			thirdGroup.userId = 'zxcv';

			const result = initiativeUtils.getNameMatchGroupFromInitiative(
				initiative,
				'testUserId',
				'notFound'
			);
			expect(result.errorMessage).toBeTruthy();
		});
	});
});
