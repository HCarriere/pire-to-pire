import { RouterConfig, provideRouter } from '@angular/router';

import { ArticlesListComponent } from './imports/articles/articles-list.component';
import { ArticleDetailsComponent } from './imports/articles/article-details.component';

const routes: RouterConfig = [
	{ path: '', component: ArticlesListComponent },
	{ path: 'article/:articleId', component: ArticleDetailsComponent }
	
];

export const APP_ROUTER_PROVIDERS = [
	provideRouter(routes)
];

