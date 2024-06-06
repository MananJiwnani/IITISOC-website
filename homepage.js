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
            
          
 
 
      
