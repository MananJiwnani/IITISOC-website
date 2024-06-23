// toggle hamburger
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
  
  
  
  //  location 
 const p =document.getElementsByClassName('search_text')
 const  f =document.querySelector('.location')
     p[0].onclick =function(){
             f.classList.toggle('display')
        }
        const q =document.getElementById('city')
        const k =document.getElementById('state')
        const h =document.getElementById('country')
          
        function func(){
          let loc = `${q.value}  ${k.value} ${h.value}`;
          p[0].innerText = loc;
        } 
   
             q.addEventListener('change',func);
             k.addEventListener('change',func);
             h.addEventListener('change',func);
  //  property_types
           p[1].onclick = function(){
           const Property_type=  document.querySelector('.Property_type')
           Property_type.classList.toggle('display')
          

           
          z = document.getElementsByClassName('type');
          for (const j of z) {
            j.classList.add('display') 
          }         
           }
           

const property =document.getElementsByClassName('Propertytype')
let x;
         for (const i of property) {
             i.onclick = function(){
                 x = `${i.innerText}`;
                const y = document.getElementsByClassName(x);
                  for (const j of y) {
                    j.classList.toggle('display') 
                  }     
                 }   
         }
    const a = document.getElementsByClassName('type')
    const d = document.getElementsByClassName('search_text')
     
     for (const i of a) {
          i.onclick =function(){
           let b = `${i.innerText}`
           let  c = `${i.parentElement.id}`
             d[1].innerText = `${c} ,${b}`;
          }
     }
        
    //  budget
    const budget =document.querySelector('.budget')
      p[2].onclick = function(){
        budget.classList.toggle('display');
      } 
           
         


     
      const container = document.body.querySelector(".listings")

      const addCard = ()=>{
          var newCard = document.createElement('div');
          newCard.classList.add("grid_item")
          newCard.innerHTML=`
                  <div class="card">
                    <div class="image">
                        <img src="assets/home1.jpg" alt="Rental Property" class="card-img">
                    </div>
                    <div class="card-content">
                        <h2 class="card-title">3 BHK Villa</h2>
                        <p class="card-location">123 Main Street, Anytown, USA</p>
                        <p class="card-price">$1,200/month</p>
                        <!-- <p class="card-description">This beautiful family house has 3 bedrooms, 2 bathrooms, a spacious living room, and a modern kitchen.</p> -->
                        <button onclick="viewdetails(this)" class="card-button">View Details</button>
                    </div>
                </div>`
                  container.append(newCard)
      
      }
      
      
      
      
      function viewdetails(button) {
          document.body.querySelector('.blur').style.filter = 'blur(5px)';
          const card = button.closest('.card');
          card.style.width = '80vw';
          card.style.height = '60vh';
          card.style.filter = 'blur(0)'
          card.style.position= 'fixed'
          // card.style.margin='auto'
          // card.style.justifySelf = 'center'
          card.style.transition = 'transform 0.3s, z-index 0s 0.3s';
          card.style.zIndex = '1000';
      }
      
      // Optional: To reset the blur and scale effect on click outside the card
      document.addEventListener('click', (event)=> {
          const isClickInsideCard = event.target.closest('.card');
          
          if (!isClickInsideCard) {
              document.body.style.filter = '';
              const cards = document.querySelectorAll('.card');
              cards.forEach(card => {
                  card.style.transform = '';
                  card.style.zIndex = '';
                  card.style.width = '300px';
                  card.style.height = '';
                  card.style.position= ''
                  card.style.margin=''
                  card.style.justifySelf = ''
              });
          }
      });
      
      
      addCard();
      addCard();
      addCard();
      addCard();
      addCard();
      addCard();