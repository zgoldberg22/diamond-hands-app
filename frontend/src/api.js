export default async function getBasicPitches() {
   let api_url = 'http://127.0.0.1:5000/basic_pitches'

   let res = fetch(api_url)
    .then(response => response.json())
    .then(data => {
      // console.log(data)
      return data; 
   });
   // const response = await fetch("/basic_pitches"); 
   // const data = await response.json()
   return res; 
}



export async function getHeatmapData(filters) {
   let api_url = buildApiUrl(filters, 'http://127.0.0.1:5000/heatmap'); 
   // console.log(filters)
   // console.log(api_url); 

   // api_url = result === "" ? api_url : `${api_url}?result=${result}`
   const response = fetch(api_url)
      .then(response => response.json())
      .then(data => {
      // console.log(data)
      return data; 
   });
   
   return response; 
}

export async function getAllPitchGraphs(filters) {
   let api_url = buildApiUrl(filters, 'http://127.0.0.1:5000/all_pitch_graphs'); 
   console.log(api_url); 

   const response = fetch(api_url)
      .then(response => response.json())
      .then(data => {
      // console.log(data)
      return data; 
   });
   
   return response; 
}

export async function getPitchScatterPlot(filters) {
   let api_url = buildApiUrl(filters, 'http://127.0.0.1:5000/pitch_scatter_plot'); 

   // api_url = result === "" ? api_url : `${api_url}?result=${result}`
   const response = fetch(api_url)
      .then(response => response.json())
      .then(data => {
      // console.log(data)
      return data; 
   });
   
   return response; 
}

function buildApiUrl(filters, api_url) {
   let api_url_build = api_url;
   
   const queryParams = [];
 
   for (const [key, value] of Object.entries(filters)) {
     if (value !== "" && value !== false) {
       if (key === 'swing' && value) {
         queryParams.push(`${key}=true`);
       } else {
         queryParams.push(`${key}=${encodeURIComponent(value)}`);
       }
     }
   }
 
   if (queryParams.length > 0) {
      api_url_build += '?' + queryParams.join('&');
   }
 
   return api_url_build;
 }
