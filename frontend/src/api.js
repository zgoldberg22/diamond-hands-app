export default async function getBasicPitches() {
   let api_url = 'http://localhost:5555/basic_pitches'

   let res = fetch(api_url, {
      mode: 'cors',
   })
    .then(response => response.json())
    .then(data => {
      return data; 
   });

   return res; 
}


export async function getHeatmapData(filters) {
   let api_url = buildApiUrl(filters, 'http://localhost:5555/heatmap'); 

   const response = fetch(api_url, {
      mode: 'cors',
   })
      .then(response => response.json())
      .then(data => {
      return data; 
   });
   
   return response; 
}

export async function getAllPitchGraphs(filters) {
   let api_url = buildApiUrl(filters, 'http://localhost:5555/all_pitch_graphs'); 
   // console.log(api_url); 

   const response = fetch(api_url, {
      mode: 'cors',
   })
      .then(response => response.json())
      .then(data => {
      return data; 
   });
   
   return response; 
}

export async function getPitchScatterPlot(filters) {
   let api_url = buildApiUrl(filters, 'http://localhost:5555/pitch_scatter_plot'); 

   const response = fetch(api_url, {
      mode: 'cors',
   })
      .then(response => response.json())
      .then(data => {
      return data; 
   });
   
   return response; 
}

export async function getContactPlot(args) {
   let api_url = buildApiUrl(args, 'http://localhost:5555/plot_prediction'); 

   const response = fetch(api_url, {
      mode: 'cors',
   })
      .then(response => response.json())
      .then(data => {
      return data; 
   });
   
   return response; 
}

export async function getAllHits() {
   let api_url = 'http://localhost:5555/all_hits'; 

   const response = fetch(api_url, {
      mode: 'cors',
   })
      .then(response => response.json())
      .then(data => {
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
