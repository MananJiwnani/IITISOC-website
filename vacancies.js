// toggle hamburger
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



//  location 
const p = document.getElementsByClassName('search_text')
const f = document.querySelector('.location')
p[0].onclick = function () {
  f.classList.toggle('display')
}
const q = document.getElementById('city')
const k = document.getElementById('state')
const h = document.getElementById('country')

function func() {
  let loc = `${q.value}  ${k.value} ${h.value}`;
  p[0].innerText = loc;
}

q.addEventListener('change', func);
k.addEventListener('change', func);
h.addEventListener('change', func);
//  property_types
p[1].onclick = function () {
  const Property_type = document.querySelector('.Property_type')
  Property_type.classList.toggle('display')



  z = document.getElementsByClassName('type');
  for (const j of z) {
    j.classList.add('display')
  }
}


const property = document.getElementsByClassName('Propertytype')
let x;
for (const i of property) {
  i.onclick = function () {
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
  i.onclick = function () {
    let b = `${i.innerText}`
    let c = `${i.parentElement.id}`
    d[1].innerText = `${c} ,${b}`;
  }
}

//  budget
const budget = document.querySelector('.budget')
p[2].onclick = function () {
  budget.classList.toggle('display');
}





const container = document.body.querySelector(".listings")

const addCard = () => {
  var newCard = document.createElement('div');
  newCard.classList.add("grid_item")
  newCard.innerHTML = `
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
  document.body.querySelector('.listings').style.height = '70vh';
  document.body.querySelector('.listings').style.display = 'flex';
  document.body.querySelector('.listings').style.align = 'center';
  
  const cards = document.getElementsByClassName('card')
  for (let i = 0; i < cards.length; i++) {
    const element = cards [i];
    element.style.display= 'none';
    
  }
  
  const card = button.closest('.card');
  card.style.display='';
  
  card.style.width = '65vw';
  card.style.height = 'fit-content';
  card.style.position = 'absolute';
  card.style.margin = '0 auto';
  card.style.padding = '15px'
  card.style.transition = 'transform 0.3s ease, z-index 0s 0.3s';
  card.style.zIndex = '1000';
  card.querySelector('.image').style.width = '45%';
  card.querySelector('.image').style.height = 'auto';
  card.querySelector('.card-content').style.paddingTop='5px'
  card.style.flexDirection = 'row';
  button.style.display ='none'
  const buttons = document.createElement('div');
  buttons.classList.add('buttons');
  buttons.innerHTML = `<button>Rent Now</button>
  <button>Message Owner</button>`  ;
  card.querySelector('.image').append(buttons);
}


// Optional: To reset the blur and scale effect on click outside the card
document.addEventListener('click', (event) => {
  const isClickInsideCard = event.target.closest('.card');
  
  if (!isClickInsideCard) {
    document.body.style.filter = '';
    document.body.querySelector('.listings').style.height = '';
    document.body.querySelector('.listings').style.display = '';
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.style.transform = '';
      card.style.zIndex = '';
      card.style.width = '';
      card.style.height = '';
      card.style.position = ''
      card.style.margin = ''
      card.style.padding = ''
      card.style.display=''
      card.querySelector('.image').style.width = '';
      card.querySelector('.image').style.height = '';
      card.querySelector('.card-content').style.paddingTop=''
      card.style.flexDirection = '';
      const button = card.querySelector('.card-button')
      button.style.display=''
      // buttons.style.display = 'none'
      const buttons = card.querySelector('.buttons');
      if (buttons) {
        buttons.remove();
      }
    });
  }
});


addCard();
addCard();
addCard();
addCard();
addCard();