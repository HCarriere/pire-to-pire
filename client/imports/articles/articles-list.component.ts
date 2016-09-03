import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Mongo } from 'meteor/mongo';

import { Articles } from '../../../both/collections/articles.collection';
import { ArticlesFormComponent } from './articles-form.component';

import template from './articles-list.component.html';

@Component({
	selector: 'articles-list',
	template,
	directives : [ArticlesFormComponent, ROUTER_DIRECTIVES]
})



export class ArticlesListComponent implements OnInit{
	articles : Mongo.Cursor<any>;
	
	ngOnInit(){
		this.articles = Articles.find();
	}
	
	removeArticle(article){
		Articles.remove(article._id);
	}
}


