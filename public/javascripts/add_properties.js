function toggleMenu() {
    var overlay = document.getElementById("myLinks");
    var content = document.querySelector(".content");
    overlay.style.paddingTop = "100px";
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
    i.onclick = function () {
        for (const j of features) {
            display = `.${j.id}`
            z = document.querySelector(display);
            if (j === i) {
                z.classList.remove('feature_display');
            }
            else {
                z.classList.add('feature_display');
            }
        }
    }
}


// preview image 
const xP = document.querySelector('#Image');
let y;
let reader;
let u;
xP.addEventListener('change', function () {
    reader = new FileReader();
    reader.onload = () => {
        y = reader.result;
        const j = document.querySelector('.preview')
        j.src = y;
        j.classList.add('img')
        u = document.querySelector('.Image')
        u.style.backgroundImage = "url ('" + j.src + "')"
    }
    reader.readAsDataURL(xP.files[0]);
})



function changeBackground(image) {
    document.getElementById('display').innerHTML = "";
    document.getElementById('display').style.backgroundImage = "url('" + image.src + "')";
    document.getElementById('display').style.backgroundSize = "cover";
    document.getElementById('display').style.backgroundPosition = "center center";
}


async function rentOutProperty(propertyId) {
    try {
        const response = await fetch(`/myProperties/${propertyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            alert('Property Rented Out successfully');
            fetchMyProperties();
        } else {
            alert('Failed to mark Property As Rented');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while renting out the property');
    }
}


  //   togglemenu for sidebar
  const s =document.querySelector('.side');
  const sidebar = document.querySelector('.sidebar');
  const dF = document.querySelector('.diff_features');
  const nav =document.getElementById('sidebar_icon');
  const i= document.querySelector('.icon1');
  nav.addEventListener('click', ()=>{
     dF.classList.toggle("display");
     sidebar.classList.toggle("animate");
     s.classList.toggle("fit");
     i.classList.toggle("anime2");
 
  })
    const body =document.querySelector('body')

const x= document.querySelector('#Add_p');
 

     x.onclick = function(){  
       sidebar.classList.remove("animate") ;
        dF.classList.remove("display");
         s.classList.add("fit");
         i.classList.toggle("anime2");
 }
 
