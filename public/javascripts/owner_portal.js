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
       nav.classList.toggle("back");
       nav.classList.toggle("anime2");
   
    })
      const body =document.querySelector('body')

  const x= document.querySelector('#myProfile');
   

       x.onclick = function(){  
         sidebar.classList.remove("animate") ;
          dF.classList.remove("display");
           s.classList.add("fit");
           i.classList.toggle("anime2");
   }
   

//    rent estimate
document.getElementById('rent_estimate').addEventListener('submit', (e) => {
    e.preventDefault();

    const propertyType = document.getElementById('propertyTypeRE').value;
    const location = document.getElementById('location').value;
    const age = document.getElementById('age').value;
    console.log(propertyType)
    console.log(location)
    console.log(age)
    const currentPrice = parseFloat(document.getElementById('currentPrice').value);

    var yield=3.0; // Default
    console.log(typeof(yield));

    if (propertyType === 'Flat') {
        if (location === 'Metropolitan City') {
            switch (age) {
                case '0-1 yrs':
                    yield = 3.00;
                    break;
                case '1-2 yrs':
                    yield = 2.90;
                    break;
                case '2-3 yrs':
                    yield = 2.75;
                    break;
                case '3-4 yrs':
                    yield = 2.60;
                    break;
                case '4 yrs+':
                    yield = 2.50;
                    break;
            }
        } else if (location === 'Tier 2 City') {
            switch (age) {
                case '0-1 yrs':
                    yield = 3.50;
                    break;
                case '1-2 yrs':
                    yield = 3.40;
                    break;
                case '2-3 yrs':
                    yield = 3.35;
                    break;
                case '3-4 yrs':
                    yield = 3.10;
                    break;
                case '4 yrs+':
                    yield = 3.00;
                    break;
            }
        }
    } else if (propertyType === 'Villa') {
        if (location === 'Metropolitan City') {
            switch (age) {
                case '0-1 yrs':
                    yield = 2.50;
                    break;
                case '1-2 yrs':
                    yield = 2.30;
                    break;
                case '2-3 yrs':
                    yield = 2.35;
                    break;
                case '3-4 yrs':
                    yield = 2.30;
                    break;
                case '4 yrs+':
                    yield = 2.25;
                    break;
            }
        } else if (location === 'Tier 2 City') {
            switch (age) {
                case '0-1 yrs':
                    yield = 3.00;
                    break;
                case '1-2 yrs':
                    yield = 2.90;
                    break;
                case '2-3 yrs':
                    yield = 2.75;
                    break;
                case '3-4 yrs':
                    yield = 2.70;
                    break;
                case '4 yrs+':
                    yield = 2.65;
                    break;
            }
        }
    }
    console.log(yield)
    let rent = (currentPrice* yield) / 1200;
    const RE = document.querySelector(".RE");
    RE.innerHTML = `Estimated Rent: ₹${rent.toFixed(0)}`;
});
