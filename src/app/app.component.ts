import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public searchResults: any[] = [];
  public isInitialized: boolean = false;
  public itemMessages: any = {};
  public menuMessages: any = {};
  public searchText: string = 'Ranni';
  public searchTextLowerCase: string = this.searchText.toLowerCase();

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.getItemMessages().subscribe(itemMessagesResponse => {
      this.itemMessages = itemMessagesResponse;
      // TEMP
      for (let npcId in this.itemMessages["Npc"]) {
        let speakerName = this.getSpeakerName(npcId);
        console.log("Npc " + npcId + " = " + speakerName);
      }
      this.dataService.getMenuMessages().subscribe(menuMessagesResponse => {
        this.menuMessages = menuMessagesResponse;
        this.doSearch(this.searchText);
        this.isInitialized = true;
      });
    });
  }

  public getSpeakerName(speakerId: string) {
    let names = this.itemMessages["Npc"][speakerId];
    if (!names || names.length == 0) {
      return "Unknown Speaker";
    }
    let nameSet: Set<string> = new Set();
    for (let name of names) {
      if (name != null && name != "" && name != " ") {
        nameSet.add(name);
      }      
    }
    let nameArray = Array.from(nameSet);
    return nameArray.join("/");
  }

  public onNewSearchText() {
    console.log("onNewSearchText(), searchText=" + this.searchText);
    this.searchTextLowerCase = this.searchText.toLowerCase();
    this.doSearch(this.searchText);
  }

  public doSearch(text: string) {
    text = text.toLowerCase();
    this.searchResults = [];
    // Search NPC Names
    for (let npcId in this.itemMessages["Npc"]) {
      let npcNames = this.itemMessages["Npc"][npcId];
      for (let npcName of npcNames) {
        if (npcName.toLowerCase().includes(text)) {
          this.searchResults.push({
            "type": "Character",
            "name": npcName,
            "caption": "Character"
          });
        }
      }
    }
    // Search Place Names
    for (let placeId in this.itemMessages["Place"]) {
      let place = this.itemMessages["Place"][placeId];
      let placeName = place["name"];
      if (placeName != null && placeName.toLowerCase().includes(text)) {
        this.searchResults.push({
          "type": "Place",
          "name": placeName,
          "caption": "Place"
        });
      }
    }
    // Search Weapons (names and captions)
    for (let weaponId in this.itemMessages["Weapon"]) {
      let weapon = this.itemMessages["Weapon"][weaponId];
      if ((weapon["name"] != null && weapon["name"].toLowerCase().includes(text))
          || (weapon["caption"] != null && weapon["caption"].toLowerCase().includes(text))) {
        this.searchResults.push({
          "type": "Weapon",
          "name": weapon["name"],
          "info": "Weapon",
          "caption": weapon["caption"]
        });
      }
    }
    // Search Protectors (armor) (name, info, caption)
    for (let armorId in this.itemMessages["Protector"]) {
      let armor = this.itemMessages["Protector"][armorId];
      if (   (armor["name"]    != null && armor["name"   ].toLowerCase().includes(text))
          || (armor["info"]    != null && armor["info"   ].toLowerCase().includes(text))
          || (armor["caption"] != null && armor["caption"].toLowerCase().includes(text))) {
        this.searchResults.push({
          "type": "Armor",
          "name": armor["name"],
          "info": armor["info"],
          "caption": armor["caption"]
        });
      }
    }
    // Search TalkMsg
    for (let speakerId in this.menuMessages["TalkMsg"]) {
      console.log("speakerId:", speakerId);
      let conversations = this.menuMessages["TalkMsg"][speakerId];
      for (let conversationId in conversations) {
        let lines = conversations[conversationId];
        let isMatch = false;
        for (let lineId in lines) {
          let line = lines[lineId];
          if (line != null && line.toLowerCase().includes(text)) {
            isMatch = true;
            break;
          }
        }
        if (isMatch) {
          let speakerName = this.getSpeakerName(speakerId);
          let captionArray = [];
          for (let lineId in lines) {
            let line = lines[lineId];
            //captionArray.push(lineId + ": " + line);
            captionArray.push(line);
          }
          this.searchResults.push({
            "type": "Quote",
            "name": speakerName,
            "info": "Speaker #" + speakerId + ", Quote #" + conversationId,
            "caption": captionArray.join("<br>")
          });
        }
      }
    }
    // TODO: Search other items...
  }
}