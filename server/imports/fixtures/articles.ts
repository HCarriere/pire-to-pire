import { Articles } from '../../../both/collections/articles.collection';

export function loadArticles(){
	if(Articles.find().count() === 0){
		const articles = [
			{
				name:"server gen1",description:"from serv",date:"today"
			},
			{
				name:"server gen2",description:"from serv",date:"today"
			}
		];
		
		articles.forEach((article) => Articles.insert(article));
	}
}