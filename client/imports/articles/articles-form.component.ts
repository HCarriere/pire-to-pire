import { Component, OnInit } from '@angular/core';
import { REACTIVE_FORM_DIRECTIVES, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Articles } from '../../../both/collections/articles.collection';

import template from './articles-form.component.html';

@Component({
	selector: 'articles-form',
	template,
	directives: [REACTIVE_FORM_DIRECTIVES]
})

export class ArticlesFormComponent implements OnInit { 
	addForm : FormGroup;
	
	constructor(private formBuilder : FormBuilder){}
	
	ngOnInit(){
		this.addForm = this.formBuilder.group({
			name : ['',Validators.required],
			description : [],
			date : ['',Validators.required]
		});
	}
	
	resetForm(){
		this.addForm.controls['name']['updateValue']('');
		this.addForm.controls['description']['updateValue']('');
		this.addForm.controls['date']['updateValue']('');
	}
	
	addArticle(){
		if(this.addForm.valid){
			Articles.insert(this.addForm.value);
			
			this.resetForm();
		}
	}
}

