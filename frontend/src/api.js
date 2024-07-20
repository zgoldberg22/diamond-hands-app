export default async function getBasicPitches() {
   let res = fetch('http://127.0.0.1:5000/basic_pitches')
    .then(response => response.json())
    .then(data => {
      // console.log(data)
      return data; 
   });
   // const response = await fetch("/basic_pitches"); 
   // const data = await response.json()
   return res; 
}

export async function getHeatmapData(result) {
   const response = fetch(`http://127.0.0.1:5000/heatmap?result=${result}`)
      .then(response => response.json())
      .then(data => {
      console.log(data)
      return data; 
   });
   
   return response; 
}

