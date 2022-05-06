import { Component } from '@angular/core';
import { DataService } from './data.service';
import { ERMessageDataset } from './model/message-dataset';
import { NpcTalkMessages } from './model/npc-talk-messages';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public searchResults: any[] = [];
  public isInitialized: boolean = false;
  public itemMessages: ERMessageDataset = {};
  public menuMessages: ERMessageDataset = {};
  public npcTalkMessages?: NpcTalkMessages;
  public searchText: string = 'Ranni';
  public searchTextLowerCase: string = this.searchText.toLowerCase();

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.getItemMessages().subscribe(itemMessagesResponse => {
      this.itemMessages = itemMessagesResponse;
      this.dataService.getMenuMessages().subscribe(menuMessagesResponse => {
        this.menuMessages = menuMessagesResponse;
        this.initializeNpcTalkMessages();
        this.doSearch(this.searchText);
        this.isInitialized = true;
      });
    });
  }

  public initializeNpcTalkMessages() {
    this.npcTalkMessages = {};
    let npcNameData = this.itemMessages["N:\\GR\\data\\INTERROOT_win64\\msg\\engUS\\NpcName.fmg"]
    for (let id in npcNameData) {
      let npcName = npcNameData[id];
      if (npcName != null && npcName != "null") {
        let superId = null;
        if (id.length < 7) {
          superId = id.substring(id.length - 5, id.length - 2);
        } else {
          superId = id.substring(id.length - 7, id.length - 2);
        }
        if (this.npcTalkMessages[superId] == undefined) {
          this.npcTalkMessages[superId] = {
            npcNames: {},
            conversations: {}
          };
        }
        this.npcTalkMessages[superId].npcNames[id] = npcName;
      }
    }
    let talkMsgData = this.menuMessages["N:\\GR\\data\\INTERROOT_win64\\msg\\engUS\\TalkMsg.fmg"];
    for (let id in talkMsgData) {
      let talkMsg = talkMsgData[id];
      if (talkMsg != null) {
        let superId = "000";
        if (id.length > 6) {
          superId = id.substring(0, id.length - 6).padStart(3, "0");
        }
        let conversationId = id.substring(id.length - 6, id.length - 3).padStart(3, "0");
        let lineId = id.substring(id.length - 3).padStart(3, "0");
        if (this.npcTalkMessages[superId] == undefined) {
          console.log("WARN: superId=" + superId + " found in TalkMsgId=" + id + " but not NpcName");
          this.npcTalkMessages[superId] = {
            npcNames: { "0": "Unknown Speaker #" + superId }, // won't be populated
            conversations: {}
          };
        }
        if (this.npcTalkMessages[superId].conversations[conversationId] == undefined) {
          this.npcTalkMessages[superId].conversations[conversationId] = {};
        }
        this.npcTalkMessages[superId].conversations[conversationId][lineId] = talkMsg;
      }
    }
    console.log("npcTalkMessages:", this.npcTalkMessages);
  }

  public onNewSearchText() {
    console.log("onNewSearchText(), searchText=" + this.searchText);
    this.searchTextLowerCase = this.searchText.toLowerCase();
    this.doSearch(this.searchText);
  }

  public anyMatch(text: string, s1: string, s2?: string, s3?: string, s4?: string) {
    if (s1 != null && s1.toLowerCase().includes(text)) {
      return true;
    }
    if (s2 != null && s2.toLowerCase().includes(text)) {
      return true;
    }
    if (s3 != null && s3.toLowerCase().includes(text)) {
      return true;
    }
    if (s4 != null && s4.toLowerCase().includes(text)) {
      return true;
    }
    return false;
  }

  public doSearch(text: string) {
    text = text.toLowerCase();
    this.searchResults = [];
    let FMG_FOLDER = "N:\\GR\\data\\INTERROOT_win64\\msg\\engUS\\";
    // search npc names
    for (let id in this.itemMessages[FMG_FOLDER + "NpcName.fmg"]) {
      let name = this.itemMessages[FMG_FOLDER + "NpcName.fmg"][id];
      if (this.anyMatch(text, name)) {
        this.searchResults.push({
          "type": "Character",
          "name": name,
          "info": "Name of Character #" + id
        });
      }
    }
    // Search TalkMsg
    for (let superId in this.npcTalkMessages) {
      console.log("superId:", superId);
      let npcInfo = this.npcTalkMessages[superId];
      let npcNameSet = new Set<String>();
      for (let npcNameId in npcInfo.npcNames) {
        npcNameSet.add(npcInfo.npcNames[npcNameId]);
      }
      let speakerName = Array.from(npcNameSet).join("/");
      let addAllConversations = false;
      if (this.anyMatch(text, speakerName)) {
        addAllConversations = true;
      }
      for (let conversationId in npcInfo.conversations) {
        let lines = npcInfo.conversations[conversationId];
        let isMatch = false;
        if (addAllConversations) {
          isMatch = true;
        } else {
          for (let lineId in lines) {
            let line = lines[lineId];
            if (line != null && line.toLowerCase().includes(text)) {
              isMatch = true;
              break;
            }
          }
        }
        if (isMatch) {
          let captionArray = [];
          for (let lineId in lines) {
            let line = lines[lineId];
            if (lineId.endsWith("1")) {
              line = "<i>" + line + " [F]</i>"; // if player is female
            }
            captionArray.push(line);
          }
          this.searchResults.push({
            "type": "Quote",
            "name": speakerName,
            "info": "Speaker #" + superId + ", Quote #" + conversationId,
            "caption": captionArray.join("<br>")
          });
        }
      }
    }
    // search place names
    for (let id in this.itemMessages[FMG_FOLDER + "PlaceName.fmg"]) {
      let name = this.itemMessages[FMG_FOLDER + "PlaceName.fmg"][id];
      if (this.anyMatch(text, name)) {
        this.searchResults.push({
          "type": "Place",
          "name": name,
          "info": "Name of Place #" + id
        });
      }
    }
    // search weapons
    for (let id in this.itemMessages[FMG_FOLDER + "WeaponName.fmg"]) {
      let name = this.itemMessages[FMG_FOLDER + "WeaponName.fmg"][id];
      let info = this.itemMessages[FMG_FOLDER + "WeaponInfo.fmg"][id];
      let caption = this.itemMessages[FMG_FOLDER + "WeaponCaption.fmg"][id];
      if (this.anyMatch(text, name, info, caption)) {
        this.searchResults.push({
          "type": "Weapon",
          "name": name,
          "info": info,
          "caption": caption
        });
      }
    }
    // search armors
    for (let id in this.itemMessages[FMG_FOLDER + "ProtectorName.fmg"]) {
      let name = this.itemMessages[FMG_FOLDER + "ProtectorName.fmg"][id];
      let info = this.itemMessages[FMG_FOLDER + "ProtectorInfo.fmg"][id];
      let caption = this.itemMessages[FMG_FOLDER + "ProtectorCaption.fmg"][id];
      if (this.anyMatch(text, name, info, caption)) {
        this.searchResults.push({
          "type": "Armor",
          "name": name,
          "info": info,
          "caption": caption
        });
      }
    }
    // search talismans
    for (let id in this.itemMessages[FMG_FOLDER + "AccessoryName.fmg"]) {
      let name = this.itemMessages[FMG_FOLDER + "AccessoryName.fmg"][id];
      let info = this.itemMessages[FMG_FOLDER + "AccessoryInfo.fmg"][id];
      let caption = this.itemMessages[FMG_FOLDER + "AccessoryCaption.fmg"][id];
      if (this.anyMatch(text, name, info, caption)) {
        this.searchResults.push({
          "type": "Talisman",
          "name": name,
          "info": info,
          "caption": caption
        });
      }
    }
    // search goods (items)
    for (let id in this.itemMessages[FMG_FOLDER + "GoodsName.fmg"]) {
      let name = this.itemMessages[FMG_FOLDER + "GoodsName.fmg"][id];
      let info = this.itemMessages[FMG_FOLDER + "GoodsInfo.fmg"][id];
      let info2 = this.itemMessages[FMG_FOLDER + "GoodsInfo2.fmg"][id];
      let caption = this.itemMessages[FMG_FOLDER + "GoodsCaption.fmg"][id];
      if (this.anyMatch(text, name, info, info2, caption)) {
        if (info2 != null) {
          info = info + " | " + info2;
        }
        this.searchResults.push({
          "type": "Item",
          "name": name,
          "info": info,
          "caption": caption
        });
      }
    }
    // search goods dialog
    for (let id in this.itemMessages[FMG_FOLDER + "GoodsDialog.fmg"]) {
      let caption = this.itemMessages[FMG_FOLDER + "GoodsDialog.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "Talk",
          "name": "Item Dialog",
          "info": null,
          "caption": caption
        });
      }
    }
    // search gems (ash of war not yet applied)
    for (let id in this.itemMessages[FMG_FOLDER + "GemName.fmg"]) {
      let name = this.itemMessages[FMG_FOLDER + "GemName.fmg"][id];
      let info = this.itemMessages[FMG_FOLDER + "GemInfo.fmg"][id];
      let caption = this.itemMessages[FMG_FOLDER + "GemCaption.fmg"][id];
      if (this.anyMatch(text, name, info, caption)) {
        this.searchResults.push({
          "type": "Item",
          "name": name,
          "info": info,
          "caption": caption
        });
      }
    }
    // search arts (skill from ash of war)
    for (let id in this.itemMessages[FMG_FOLDER + "ArtsName.fmg"]) {
      let name = this.itemMessages[FMG_FOLDER + "ArtsName.fmg"][id];
      let caption = this.itemMessages[FMG_FOLDER + "ArtsCaption.fmg"][id];
      if (this.anyMatch(text, name, caption)) {
        this.searchResults.push({
          "type": "Item",
          "name": name,
          "info": "Skill",
          "caption": caption
        });
      }
    }
    // search loading screens
    for (let id in this.menuMessages[FMG_FOLDER + "LoadingTitle.fmg"]) {
      let title = this.menuMessages[FMG_FOLDER + "LoadingTitle.fmg"][id];
      let caption = this.menuMessages[FMG_FOLDER + "LoadingText.fmg"][id];
      if (this.anyMatch(text, title, caption)) {
        this.searchResults.push({
          "type": "Grace",
          "name": title,
          "info": "Loading Screen",
          "caption": caption
        });
      }
    }
    // search tutorial screens
    for (let id in this.menuMessages[FMG_FOLDER + "TutorialTitle.fmg"]) {
      let title = this.menuMessages[FMG_FOLDER + "TutorialTitle.fmg"][id];
      let caption = this.menuMessages[FMG_FOLDER + "TutorialBody.fmg"][id];
      if (this.anyMatch(text, title, caption)) {
        this.searchResults.push({
          "type": "Grace",
          "name": title,
          "info": "Tutorial Screen",
          "caption": caption
        });
      }
    }
    // search messages that can be left on the ground
    for (let id in this.menuMessages[FMG_FOLDER + "BloodMsg.fmg"]) {
      let caption = this.menuMessages[FMG_FOLDER + "BloodMsg.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "MessageOnGround",
          "name": "Blood Message",
          "info": "A message that can be found on the ground",
          "caption": caption
        });
      }
    }
    // search network messages
    for (let id in this.menuMessages[FMG_FOLDER + "NetworkMessage.fmg"]) {
      let caption = this.menuMessages[FMG_FOLDER + "NetworkMessage.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "Online",
          "name": "Network Message",
          "info": "A message related to online play",
          "caption": caption
        });
      }
    }



    // search EventTextForTalk
    for (let id in this.menuMessages[FMG_FOLDER + "EventTextForTalk.fmg"]) {
      let caption = this.menuMessages[FMG_FOLDER + "EventTextForTalk.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "Quote",
          "name": "Event Message: Talk",
          "info": "Event message for talk",
          "caption": caption
        });
      }
    }
    // search EventTextForMap
    for (let id in this.menuMessages[FMG_FOLDER + "EventTextForMap.fmg"]) {
      let caption = this.menuMessages[FMG_FOLDER + "EventTextForMap.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "Quote",
          "name": "Event Message: Map",
          "info": "Event message for map",
          "caption": caption
        });
      }
    }
    // search GR_Dialogues
    for (let id in this.menuMessages[FMG_FOLDER + "GR_Dialogues.fmg"]) {
      let caption = this.menuMessages[FMG_FOLDER + "GR_Dialogues.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "Quote",
          "name": "GR Dialogue",
          "info": "Game dialogue",
          "caption": caption
        });
      }
    }
    // search GR_LineHelp
    for (let id in this.menuMessages[FMG_FOLDER + "GR_LineHelp.fmg"]) {
      let caption = this.menuMessages[FMG_FOLDER + "GR_LineHelp.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "Grace",
          "name": "GR Line Help",
          "info": "Game single line help message",
          "caption": caption
        });
      }
    }
    // search GR_MenuText
    for (let id in this.menuMessages[FMG_FOLDER + "GR_MenuText.fmg"]) {
      let caption = this.menuMessages[FMG_FOLDER + "GR_MenuText.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "Grace",
          "name": "GR Menu Text",
          "info": "Game menu text",
          "caption": caption
        });
      }
    }
    // search ActionButtonText
    for (let id in this.menuMessages[FMG_FOLDER + "ActionButtonText.fmg"]) {
      let caption = this.menuMessages[FMG_FOLDER + "ActionButtonText.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "Grace",
          "name": "Action Button Text",
          "info": "text shown to interact with something in the world",
          "caption": caption
        });
      }
    }
    // search GR_KeyGuide
    for (let id in this.menuMessages[FMG_FOLDER + "GR_KeyGuide.fmg"]) {
      let caption = this.menuMessages[FMG_FOLDER + "GR_KeyGuide.fmg"][id];
      if (this.anyMatch(text, caption)) {
        this.searchResults.push({
          "type": "Grace",
          "name": "Key Guide",
          "info": "text shown in key guide",
          "caption": caption
        });
      }
    }
  }
}
