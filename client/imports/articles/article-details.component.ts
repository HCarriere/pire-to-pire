import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tracker } from 'meteor/tracker';

import { Articles } from '../../../both/collections/articles.collection.ts';

import template from './article-details.component.html';

@Component({
	selector: 'party-details',
	template
})

export class ArticleDetailsComponent implements OnInit{
	articleId: string;
	article: any;
	
	constructor(private route: ActivatedRoute, private ngZone : NgZone){}
	
	ngOnInit(){
		this.route.params
			.map(params => params['articleId'])
			.subscribe(articleId => {
				this.articleId = articleId;
				Tracker.autorun(() => {
					this.ngZone.run(() => {
						this.article = Articles.findOne(this.articleId);
					});
				});
			});
	}
}