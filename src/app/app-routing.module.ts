import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { AllConversationsComponent } from './all-conversations/all-conversations.component';

//This is my case 
const routes: Routes = [
    {
        path: 'search',
        component: SearchComponent
    },
    {
        path: 'conversations',
        component: AllConversationsComponent
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
