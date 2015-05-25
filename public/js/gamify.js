//Gamification Logic 


	function gamify(req_type, all_points, hi_res)
	{

		//Newbie  (0 - 49)
		//Beginn (50 - 99)
		//Inter  (100 - 299)
		//Master 300+

		//Define Levels 
		var level1 = 0;     //Novice
		var level2 = 10;     //Beginner
		var level3 = 25;    //Beginner I
		var level4 = 50;    //Beginner II
		var level5 = 90;    //Beginner III
		var level6 = 150;    //Intermediate 
		var level7 = 225;    //Intermediate I
		var level8 = 300;    //Intermediate II
		var level9 = 400;    //Intermediate III
		var level10 = 500;   //Seasoned
		var level11 = 600;   //Apprentice 
		var level12 = 700;   //Apprentice I
		var level13 = 800;   //Apprentice II
		var level14 = 1000;   //Apprentice III
		var level15 = 1250;   //Apprentice IV
		var level16 = 1850;   //Expert 
		var level17 = 2100;   //Expert I 
		var level18 = 2500;   //Expert II
		var level19 = 4000;   //Master
		var level20 = 6000;   //Grand Master
		var level21 = 8000;  //Elite
		var level22 = 10000;  //Top Elite
		
		//console.log("req_type" + ":" + req_type + "," + "all_points" + ":" + all_points + "," +  "hi_res" + ":" + hi_res)

		if (all_points < level2) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/1.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/1.png";
			}
			else if (req_type === 'text') {
				return "Novice";
			}
			else if (req_type === 'levelup') {
				return level2 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level1;
			}
		}
		else if (all_points >= level2 && all_points < level3) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/2.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/2.png";
			}
			else if (req_type === 'text') {
				return "Beginner";
			}
			else if (req_type === 'levelup') {
				return level3 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level2;
			}
		}
		else if (all_points >= level3 && all_points < level4) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/3.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/3.png";
			}
			else if (req_type === 'text') {
				return "Beginner I";
			}
			else if (req_type === 'levelup') {
				return level4 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level3;
			}
		}
		else if (all_points >= level4 && all_points < level5) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/4.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/4.png";
			}
			else if (req_type === 'text') {
				return "Beginner II";
			}
			else if (req_type === 'levelup') {
				return level5 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level4;
			}
		}
		else if (all_points >= level5 && all_points < level6) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/5.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/5.png";
			}
			else if (req_type === 'text') {
				return "Beginner III";
			}
			else if (req_type === 'levelup') {
				return level6 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level5;
			}
		}
		else if (all_points >= level6 && all_points < level7) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/6.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/6.png";
			}
			else if (req_type === 'text') {
				return "Intermediate";
			}
			else if (req_type === 'levelup') {
				return level7 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level6;
			}
		}
		else if (all_points >= level7 && all_points < level8) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/7.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/7.png";
			}
			else if (req_type === 'text') {
				return "Intermediate I";
			}
			else if (req_type === 'levelup') {
				return level8 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level7;
			}
		}
		else if (all_points >= level8 && all_points < level9) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/8.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/8.png";
			}
			else if (req_type === 'text') {
				return "Intermediate II";
			}
			else if (req_type === 'levelup') {
				return level9 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level8;
			}
		}
		else if (all_points >= level9 && all_points < level10) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/9.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/9.png";
			}
			else if (req_type === 'text') {
				return "Intermediate III";
			}
			else if (req_type === 'levelup') {
				return level10 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level9;
			}
		}
		else if (all_points >= level10 && all_points < level11) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/10.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/10.png";
			}
			else if (req_type === 'text') {
				return "Seasoned";
			}
			else if (req_type === 'levelup') {
				return level11 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level10;
			}
		}
		else if (all_points >= level11 && all_points < level12) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/11.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/11.png";
			}
			else if (req_type === 'text') {
				return "Apprentice";
			}
			else if (req_type === 'levelup') {
				return level12 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level11;
			}
		}
		else if (all_points >= level12 && all_points < level13) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/12.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/12.png";
			}
			else if (req_type === 'text') {
				return "Apprentice I";
			}
			else if (req_type === 'levelup') {
				return level13 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level12;
			}
		}
		else if (all_points >= level13 && all_points < level14) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/13.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/13.png";
			}
			else if (req_type === 'text') {
				return "Apprentice II";
			}
			else if (req_type === 'levelup') {
				return level14 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level13;
			}
		}
		else if (all_points >= level14 && all_points < level15) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/14.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/14.png";
			}
			else if (req_type === 'text') {
				return "Apprentice III";
			}
			else if (req_type === 'levelup') {
				return level15 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level14;
			}
		}
		else if (all_points >= level15 && all_points < level16) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/15.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/15.png";
			}
			else if (req_type === 'text') {
				return "Apprentice IV";
			}
			else if (req_type === 'levelup') {
				return level16 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level15;
			}
		}
		else if (all_points >= level16 && all_points < level17) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/16.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/16.png";
			}
			else if (req_type === 'text') {
				return "Expert";
			}
			else if (req_type === 'levelup') {
				return level17 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level16;
			}
		}
		else if (all_points >= level17 && all_points < level18) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/17.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/17.png";
			}
			else if (req_type === 'text') {
				return "Expert I";
			}
			else if (req_type === 'levelup') {
				return level18 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level17;
			}
		}
		else if (all_points >= level18 && all_points < level19) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/18.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/18.png";
			}
			else if (req_type === 'text') {
				return "Expert II";
			}
			else if (req_type === 'levelup') {
				return level19 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level18;
			}
		}
		else if (all_points >= level19 && all_points < level20) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/19.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/19.png";
			}
			else if (req_type === 'text') {
				return "Master";
			}
			else if (req_type === 'levelup') {
				return level20 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level19;
			}
		}
		else if (all_points >= level20 && all_points < level21) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/20.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/20.png";
			}
			else if (req_type === 'text') {
				return "Grand Master";
			}
			else if (req_type === 'levelup') {
				return level21 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level20;
			}
		}
		else if (all_points >= level21 && all_points < level22) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/21.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/21.png";
			}
			else if (req_type === 'text') {
				return "Elite";
			}
			else if (req_type === 'levelup') {
				return level22 - all_points;
			}
			else if (req_type === 'levelbase') {
				return level21;
			}
		}
		else if (all_points >= level22) {
			if (req_type === 'image' && hi_res === false) {
				return "assets/images/22.png";
			}
			else if (req_type === 'image' && hi_res === true) {
				return "assets/images/22.png";
			}
			else if (req_type === 'text') {
				return "Top Elite";
			}
			else if (req_type === 'levelup') {
				return 0;
			}
			else if (req_type === 'levelbase') {
				return level4;
			}
		}

	}