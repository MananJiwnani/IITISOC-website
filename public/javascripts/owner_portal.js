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


    async function fetchMyProperties() {
      try {
          const response = await fetch('/api/myproperties');
          if (!response.ok) {
              throw new Error('Failed to fetch properties');
          }
          const properties = await response.json();
          displayProperties(properties);
      } catch (error) {
          console.error('Error fetching properties:', error);
          document.getElementById('rented-properties-list').innerText = 'Error fetching properties';
          document.getElementById('other-properties-list').innerText = 'Error fetching properties';
      }
  }

  function displayProperties(properties) {
      const rentedPropertiesList = document.getElementById('rented-properties-list');
      rentedPropertiesList.innerHTML = '';

      const otherPropertiesList = document.getElementById('other-properties-list');
      otherPropertiesList.innerHTML = '';

      if (properties.length === 0) {
          rentedPropertiesList.innerText = 'No properties found';
          otherPropertiesList.innerText = 'No properties found';
          return;
      }

      properties.forEach(property => {
          const propertyItem = document.createElement('div');
          propertyItem.className = 'property-item';

          propertyItem.innerHTML =`
                <div class="image">
                    ${property.images.map(image => `<img src="${image}" alt="Property Image" class="card-img">`).join('')}
                    </div>
                    <div class="card-content">
                        <h2 class="card-title">${property.subCategory} ${property.propertyType}</h2>
                        <p class="card-location">${property.address}, ${property.city}, ${property.state}</p>
                        <p class="card-price">₹${property.price}/month</p>
                        <a href="/property"><button class="card-button">View Details</button></a>
                    </div>`;

          if (property.rentedOut) {
              rentedPropertiesList.appendChild(propertyItem);
          } else {
              otherPropertiesList.appendChild(propertyItem);
          }
      });
  }

  async function rentOutProperty(propertyId) {
      try {
          const response = await fetch(`/myproperties/${propertyId}`, {
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

  window.onload = fetchMyProperties;