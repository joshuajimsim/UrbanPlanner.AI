var buttonStatus = [];
var count = 0;

//initalize buttons to be on
//turn on all buttons 
function turnOnAllButtons(){
const list = document .getElementsByClassName("btn-secondary");   
    var i;
      
      for(i=0;i<list.length;i++){
          
          buttonStatus[i] = true;
          if(list[i].id == "button1"){ 
              //list[i].style.backgroundColor = "#29d148";
              list[i].style.backgroundColor = "#00ba19";
              console.log("button1");
          }
          
          else{
                //list[i].style.backgroundColor = "#339966";
              list[i].style.backgroundColor = "#005019";
            }
          list[i].style.color = "white"; 
           list[i].activated = true;
      }
}

//code for changing the colour of the buttons after they have been pressed. 
function buttonStyleHandler(_this) {

//get all the button elements and their details    
const list = document .getElementsByClassName("btn-secondary");   
    //switch the current status of the button that was pressed. 
  _this.activated = !_this.activated;
    
  //if the button that was pressed was inactive but is now active....    
  if ( _this.activated == 1) {
   
    if(_this.id == "button1"){  
        _this.style.backgroundColor = "#00ba19";
    }
    else{
        _this.style.backgroundColor ="#005019";
    }  
    _this.style.color = "white";
  }
  
  //if the button is now inactive  
  else {
      
    _this.style.backgroundColor = "buttonface";
    _this.style.color = "black";
      
    if (buttonStatus[0] == true){
        
        list[0].activated = false;
        list[0].style.backgroundColor = "buttonface";
        list[0].style.color = "black";
        
    }    
      
  }
    
  //handle the button All being pressed   
  if (_this.id == "button1"){ 
    
      var i;
      
      for(i=0;i<list.length;i++){
        
        if(list[i].id == "button1"){
            
        }
        else{  
        list[i].activated = _this.activated; 
            
            //turn on all buttons 
            if (list[i].activated == 1){
            
                list[i].style.backgroundColor = "#005019";
                list[i].style.color = "white";
                
            }
            
            //turn off all buttons if all button is turned off. 
            else {
                
                list[i].style.backgroundColor = "buttonface";
                list[i].style.color = "black";
                
            }
        }
    }  
  }
    
    //update the status of all buttons. 
    var j;
    for(j=0;j<list.length;j++){

        buttonStatus[j] = list[j].activated;

        }

    console.log(buttonStatus);    
}