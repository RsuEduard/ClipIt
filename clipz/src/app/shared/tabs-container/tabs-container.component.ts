import {
  AfterContentInit,
  Component,
  ContentChildren,
  OnInit,
  QueryList,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.scss'],
})
export class TabsContainerComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> =
    new QueryList();

  ngAfterContentInit(): void {
    const activeTab = this.tabs.find((tab) => tab.active);
    if (!activeTab) {
      this.selectTab(this.tabs.first);
    }
  }

  selectTab(tab: TabComponent): boolean {
    this.tabs.forEach((tab) => {
      tab.active = false;
    });

    tab.active = true;

    //prevent default behaviour
    return false;
  }

  getTabClass(tab: TabComponent): string {
    if (tab.active) {
      return 'hover:text-white text-white bg-indigo-400';
    }
    return 'hover:text-indigo-400';
  }
}
