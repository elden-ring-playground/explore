// The structure of an NpcName's ID in elden-ring-data/msg/{$LANG}/item.msgbnd.dcx.json is one of:
// NPC NAME ID:
// 280 x 6 digits =    1XXXYY      (XXX = identity, YY = variant/instance)
//  16 x 8 digits =  1XXXXXYY      (TODO) ("Someone yet unseen")
// 232 x 9 digits = 90XXXXXYY      (TODO) (Bosses)

// The structure of a TalkMsg's ID in elden-ring-data/msg/{$LANG}/menu.msgbnd.dcx.json is one of:
//   few x <7 digits =    CCCLLL   (CCC = lines in a conversation)
//   628 x  8 digits =  ??CCCLLL   (CCC = conversation)
// 58946 x  9 digits = NNNCCCLLL   (NNN = npc id, CCC = conversation, LLL = lines within a conversation, last digit 1 if female) 

// The "Super ID" refers to XXX in NpcName ID and NNN in TalkMsgID

export interface NpcTalkMessages {
    [npcSuperId: string]: {
        npcNames: {
            [npcNameId: string]: string;
        };
        conversations: {
            [conversationId: string]: {
                [talkMsgId: string]: string;
            };
        }
    }
};
