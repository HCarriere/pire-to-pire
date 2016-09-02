import { loadArticles } from './imports/fixtures/articles';
import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
	loadArticles();
});