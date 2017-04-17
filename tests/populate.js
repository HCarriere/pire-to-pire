const mongo = require('../app/mongo')
const utils = require('../app/utils')
const config = require('../config')
const cleanMongo = require('./clean_mongo').init

const ArticleSchema = require('../app/article').Schema
const UserSchema = require('../app/user').Schema
const ChatMessageSchema = require('../app/chat').Schema
const InboxSchema = require('../app/inbox').Schema
const ShareableSchema = require('../app/shared').Schema

const Law = require('../app/user').law;

/********************
populate.js
Va créer des :

users,
articles,
shareds,
news,
chatmessages,
inbox messages

Tous seront liés, utilisables, avec du contenu généré aléatoirement.

*********************/

const stats = {
	users:200,
	articles:{
		max:500,
		perUserMin:0,
		perUserMax:8
	},
	shareds:{
		max:500,
		perUserMin:0,
		perUserMax:8
	},
	news:{
		max:150,
		perUserMin:0,
		perUserMax:8
	},
	chatMessages:{
		max:1000,
		perUserMin:0,
		perUserMax:12
	},
	inbox:{
		max:800,
		perUserMin:0,
		perUserMax:10
	}
}




function init(){
	console.log("Population initialized");
	cleanMongo(function(){
		console.log("Cleaning done.");
		populateStep(steps);
	});
}
	
function getUserDataArray(){
	var array = [];
	for(var i = 0;i<stats.users;i++){
		var surname = names[randCent()];
		var name = names[randCent()];
		var discriminent = Math.floor(Math.random()*1000);
		array.push({
			login:surname+""+discriminent,
			password:utils.encryptPassword("123"),//same password for everyone
			fullName:surname+" "+name,
			mail:surname+"."+name+""+discriminent+"@"+"gmail.com",
			privileges:Law.roles.WRITER.defaultRights,
			rank:Law.roles.WRITER.name,
			inscriptionDate:randomDate(),
			verified:true
		});
	}
	return array;
}

function getArticleDataArray(){
	var array = [];
	var remaining = stats.articles.max;
	for(var i = 0;i<stats.users;i++){
		var num = rand(stats.articles.perUserMin,stats.articles.perUserMax);
		for(var y = 0; y<num; y++){
			var title = randomTitle();
			array.push({
				name:title,
				shortName: utils.getShortName(title),
				content: randomContent(),
				publicationDate:randomDate(),
				tags:getRandomTags(),
				author: userArray[i].login,
				isNews: false
			});
			remaining--;
			if(remaining <= 0){
				return array;
			}
		}
	}
	return array;
}

function getSharedDataArray(){
	var array = [];
	var remaining = stats.shareds.max;
	for(var i = 0;i<stats.users;i++){
		var num = rand(stats.shareds.perUserMin,stats.shareds.perUserMax);
		for(var y = 0; y<num; y++){
			var title = randomTitle();
			array.push({
				name:title,
				shortName: utils.getShortName(title),
				description: randomContent(),
				publicationDate:randomDate(),
				tags:getRandomTags(),
				author: userArray[i].login,
				uploadedObject : {
					name:'Super source',
					location:'super_source.zip',
					size:14684,
					extension:randomExt()
				}
			});
			remaining--;
			if(remaining <= 0){
				return array;
			}
		}
	}
	return array;
}

function getNewsDataArray(){
	var array = [];
	var remaining = stats.news.max;
	for(var i = 0;i<stats.users;i++){
		var num = rand(stats.news.perUserMin,stats.news.perUserMax);
		for(var y = 0; y<num; y++){
			var title = randomTitle();
			array.push({
				name:title,
				shortName: utils.getShortName(title),
				content: randomContent(),
				publicationDate:randomDate(),
				tags:getRandomTags(),
				author: userArray[i].login,
				isNews: true
			});
			remaining--;
			if(remaining <= 0){
				return array;
			}
		}
	}
	return array;
}

function getChatMessageDataArray(){
	var array = [];
	var remaining = stats.chatMessages.max;
	for(var i = 0;i<stats.users;i++){
		var num = rand(stats.chatMessages.perUserMin,stats.chatMessages.perUserMax);
		for(var y = 0; y<num; y++){
			array.push({
				message:randomTitle(1,30),
				date:randomDate(),
				author:userArray[i].login
			});
			remaining--;
			if(remaining <= 0){
				return array;
			}
		}
	}
	return array;
}

function getInboxMessagesDataArray(){
	var array = [];
	var remaining = stats.inbox.max;
	for(var i = 0;i<stats.users;i++){
		var num = rand(stats.inbox.perUserMin,stats.inbox.perUserMax);
		for(var y = 0; y<num; y++){
			array.push({
				author:userArray[i].login,
				to:userArray[rand(0,stats.users)].login,
				date:randomDate(),
				subject:randomTitle(),
				content:randomContent(),
				seen:randCent()>75?true:false
			});
			remaining--;
			if(remaining <= 0){
				return array;
			}
		}
	}
	return array;
}


function populateStep(_steps){
	if(_steps.length<=0){
		console.log("Populating complete.");
		process.exit();
		return;
	}
	var step = _steps.shift();
	var dataArray = step.dataArray;
	console.log("populating "+dataArray.length+" "+step.schema.collection+"...");
	mongo.processFunction(mongo.add, step.schema, dataArray, 0, function(){
        populateStep(_steps);
    })
}

/*
utils
*/

const startDate = new Date(2016, 6, 15);
const endDate = new Date();

function randomDate(){
	return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

function randCent(){
	return Math.floor(Math.random()*100);
}

function rand(min, max){
	return min+Math.floor(Math.random()*(max-min));
}

function randomTitle(min,max){
	if(!min) min = 2;
	if(!max) max = 5;
	var numWords = rand(min,max);
	var title = words[randCent()];
	for(var i = 0; i<numWords -1; i++){
		title+=" "+words[randCent()];
	}
	return title;
}

function randomContent(){
	var numPara = rand(2,8);
	var content = loremIpsum[rand(0,5)];
	for(var i = 0; i<numPara -1; i++){
		content+="\n"+loremIpsum[rand(0,5)];
	}
	return content;
}

function getRandomTags(){
	var num = rand(2,8);
	var tags = "";
	for(var i = 0; i<num; i++){
		var word = words[randCent()];
		tags+=word+";";
	}
	return utils.getTags(tags);
}

function randomExt(){
	return extDictionnary[rand(0, extDictionnary.length)];
}
/*****
lists
*****/
const loremIpsum = [`
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sed bibendum nisl. Praesent libero felis, varius et nunc quis, aliquam bibendum mauris. Duis lobortis viverra nisl in faucibus. Pellentesque commodo lorem suscipit commodo tincidunt. Proin vestibulum mauris eget dapibus venenatis. Nulla facilisi. Phasellus nisl ante, malesuada sit amet mattis vitae, rhoncus vitae quam. Nullam enim eros, commodo nec metus eget, faucibus mattis mi.`,

`Nullam nec dignissim purus, a accumsan mauris. In pharetra tincidunt tristique. Fusce finibus lectus eget vulputate pharetra. Integer maximus dictum placerat. Mauris ac eros sodales, mattis ante eu, pharetra risus. Sed fermentum facilisis diam, et finibus lacus. Nulla eget sem interdum, egestas tortor quis, efficitur purus. In venenatis eros vitae quam consectetur molestie. Sed sit amet ligula eu orci rutrum scelerisque. Integer feugiat id nisi eget tincidunt. Nullam elementum nec ligula vulputate mattis. Pellentesque efficitur turpis in metus euismod tristique. Cras ex erat, tincidunt sed consequat eget, varius ut ex.`,

`Duis bibendum ex in varius sodales. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam augue lacus, commodo nec felis sit amet, commodo elementum lorem. Sed euismod imperdiet ullamcorper. Sed condimentum, arcu non gravida luctus, elit nunc ultrices lectus, quis porttitor leo dolor sit amet ipsum. Pellentesque eu mi a orci dignissim aliquam sed non leo. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aenean diam augue, ullamcorper eget justo ut, tempor commodo ipsum. Etiam vitae ullamcorper ligula, sed congue nisl. Quisque mollis elit cursus lacus lacinia finibus. Integer et quam vel augue hendrerit tempor ac a tortor. Sed rutrum dolor quam, ac fringilla nibh commodo nec.`,

`Suspendisse lectus felis, aliquam sed vestibulum viverra, laoreet vel tortor. Praesent egestas scelerisque diam, eget elementum odio aliquet vitae. Phasellus a nibh ex. Maecenas ultrices mollis felis et vulputate. Nunc tempus dolor at tortor mattis eleifend non vel tellus. Integer vitae nulla malesuada, posuere orci convallis, imperdiet nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,

`Quisque nec lectus arcu. Fusce mollis dictum magna, sit amet placerat elit facilisis dignissim. Quisque a purus eleifend massa placerat porttitor. Suspendisse potenti. Aliquam tortor dolor, tempor id felis sed, scelerisque placerat sapien. Aliquam erat volutpat. Sed viverra purus at iaculis porta. Aenean feugiat, lorem vitae fringilla pulvinar, nulla purus lobortis orci, at vehicula felis mauris non sem. Ut vitae eros nunc. Suspendisse porttitor, turpis quis sagittis ornare, est est aliquam eros, at auctor ligula sapien rutrum sapien. `
];

const names = [	"Alyse","Hardeman","Delphia","Grosvenor","Illa","Furness","Angelic","Janssen","Annice","Friedrichs","Kali","Medved","Jazmine","Mcnab","Arron","Kunze","Roger","Cluck","Tessie","Nader","Jonelle","Mcclaskey","Lavada","Humbertson","Erica","Utt","Neely","Otis","Fawn","Mcnemar","Polly","Vandenburg","Venessa","Claude","Rudy","Tasker","Emilie","Arbogast","Salvatore","Overmyer","Yvonne","Fenstermaker","Martine","Mccarley","Myrl","Raber","Bridget","Rarick","Eula","Ottley","Kenton","Ballweg","Frederic","Rodrigues","Maryland","Halvorson","Russ","Benavidez","Gus","Mooring","Cathie","Kozak","Birdie","Stapler","Marlys","Burry","Olga","Adair","Rutha","Bergey","Shela","Segers","Soledad","Mccubbin","Pierre","Desimone","Lois","Hochmuth","Sau","Wilkey","Tommye","Durso","Leeanne","Rohe","Assunta","Rawley","Vena","Goers","Donetta","Maheux","Alease","Tankersley","Marta","Soja","Leroy","Amison","Odilia","Weyandt","Jenniffer","Witmer"
];

const words = [
"reed","fernandez","derust","nonsupplication","smearier","precatory","partis","unnorthern","unthirsting","assembler","intimal","rewed","bandsawn","imbrued","brekky","predisplace","prosubscription","snootier","plagae","reconsoling","trichromat","pellety","unrecuperative","catty","antiphonic","myohemoglobinuria","leucomaine","flog","reasonableness","rodded","wahiawa","helotry","amatory","deliciousness","carapacial","overwrought","supervenient","charisma","poetics","unominous","cceres","dissociability","stasimetric","chatoyancy","inadaptability","larcenist","peregrinate","retaliatory","fosse","overdiscipline","amylopsin","intortus","antiexpansionist","wester","colloq","dasahara","individualistic","transbay","chetnik","ropedancer","gelatinated","tutuila","modality","dashy","mosby","pinfish","pyothorax","kashmir","outporter","indescribableness","houseleek","unsanguinary","amravati","spar","ethician","encephaloma","readornment","boehme","implorer","downspout","biggish","plica","sultry","unwet","tentie","cheerleader","devotional","presatisfying","undertune","illume","presusceptibility","unroof","hyperpnoea","triazin","postpositively","secretin","rosenberger","nongestical","squaretoed","sentry"
];

const extDictionnary = [
  "aac","ai","aiff","avi","bmp","c","cpp","css","dat","dmg","doc","dotx","dwg","dxf","eps","exe","flv","gif","h","hpp","html","ics","iso","java","jpg","js","key","less","mid","mp3","mp4","mpg","odf","ods","odt","otp","ots","ott","pdf","php","png","ppt","psd","py","qt","rar","rb","rtf","sass","scss","sql","t.txt","tga","tgz","tiff","txt","wav","xls","xlsx","xml","yml","zip"
 ];

const userArray = getUserDataArray();
const steps = [
	{
		schema:UserSchema,
		dataArray:userArray
	},
	{
		schema:ArticleSchema,
		dataArray:getArticleDataArray()
	},
	{
		schema:ShareableSchema,
		dataArray:getSharedDataArray()
	},
	{
		schema:ArticleSchema,
		dataArray:getNewsDataArray()
	},
	{
		schema:ChatMessageSchema,
		dataArray:getChatMessageDataArray()
	},
	{
		schema:InboxSchema,
		dataArray:getInboxMessagesDataArray()
	},
]

init();