import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { PrimaryRouteComponent } from '../../../core';
import { ListsConfig } from '../../lists.config';
import { RecordsetFactoryService, RecordsetService, Recordset } from '../../../recordsets';
import { List, ListRepo } from '../../state';

@Component({
  template: `
    <content transparent="true" layout="compact">
      <list-repos class=""
          heading="Search Results"
          [recordset]="recordset$ | async"
          (needMore)="recordset.paginate()"
          (sort)="recordset.sort($event)"
          [sortable]="true"
          [infinite]="true"
          [wide]="true">
        </list-repos>
    </content>
`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSearchRouteComponent extends PrimaryRouteComponent implements OnInit, OnDestroy {

  public title;
  public list: List;

  public recordset: RecordsetService<ListRepo>;
  public recordset$: Observable<Recordset<ListRepo>>;

  constructor(
    private route: ActivatedRoute,
    private recordsetFactory: RecordsetFactoryService
  ) {
    super();
  }

  ngOnInit() {
    // Fetch resolved list
    this.route.data.forEach(({list}) => {
      this.list = list;
    });

    // Create repos recordset
    this.recordset = this.recordsetFactory.create('search-repos', ListsConfig.LIST_REPO_RECORDSET, {
      parent: this.list.id,
      size: ListsConfig.LIST_REPOS_PER_PAGE
    });

    // Set recordset observable
    this.recordset$ = this.recordset.fetch();

    // Listen to query changes
    this.route.queryParams.forEach(({q}) => {
      if (q) {
        this.recordset.filter('q', q);
      } else {
        this.recordset.unfilter('q');
      }
    });

    // Set page title
    this.title = this.list.name + ' / Search Results';
  }

  ngOnDestroy() {
    this.recordsetFactory.destroy('search-repos');
  }
}