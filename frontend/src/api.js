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
   let api_url = 'http://127.0.0.1:5000/heatmap'; 
   api_url = result === "" ? api_url : `${api_url}?result=${result}`
   const response = fetch(api_url)
      .then(response => response.json())
      .then(data => {
      console.log(data)
      return data; 
   });
   
   return response; 
}

