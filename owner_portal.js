function toggleMenu() {
    var overlay = document.getElementById("myLinks");
    var content = document.querySelector(".content");
    overlay.style.paddingTop="100px";
    if (overlay.style.width === "30vw") {
        overlay.style.width = "0";
        content.classList.remove("blur");
    } else {
        overlay.style.width = "30vw";
        content.classList.add("blur");
    }
}

//    different features 
   let features = document.querySelectorAll('.feature');
   let display;
   let z;
   for (const i of features) {
        i.onclick = function(){
            for (const j  of features) {
                display = `.${j.id}`
              z = document.querySelector(display);
              if(j===i){
                  z.classList.remove('feature_display') ;
              }
              else{
                z.classList.add('feature_display') ;
              }
            } 
        }
   }
    // preview image 
    const x = document.querySelector('#Image');
    let y;
    let reader;
    let u;
      x.addEventListener('change',function(){
         reader = new FileReader();
        reader.onload= ()=>{
           y = reader.result;
            const j =document.querySelector('.preview')
            j.src = y;
           j.classList.add('img')
            u = document.querySelector('.Image')
            u.style.backgroundImage ="url ('"+j.src+"')"
        }
        reader.readAsDataURL(x.files[0]);
      })



      function changeBackground(image){
        document.getElementById('display').innerHTML="";
        document.getElementById('display').style.backgroundImage="url('"+image.src+"')";
        document.getElementById('display').style.backgroundSize="cover";
        document.getElementById('display').style.backgroundPosition="center center";
    }