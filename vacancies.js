 const p =document.getElementsByClassName('search_text')
 const  f =document.getElementsByClassName('select')
     p[0].onclick =function(){
      p[0].style.color = 'black'
          for (const j of f) {
             j.classList.toggle('display')
          }
        }
           p[1].onclick = function(){
           const a=  document.getElementsByClassName('Property_type')
       for (const k of a) {
           k.classList.toggle('display')
          }
          z = document.getElementsByClassName('type');
          for (const j of z) {
            j.classList.add('display') 
          }         
           }
           
//   for  property types 
const property =document.getElementsByClassName('Property_type')
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
            i.style.color = 'white'
           let b = `${i.innerText}`
           let  c = `${i.parentElement.id}`
             d[1].innerText = `${c} ,${b}`;
          }
     }
        
