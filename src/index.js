import axios from 'axios';
import splitEasy from 'csv-split-easy';
module.exports = async() => {
  try {
    let region;
    const result = [];
    const downloadedDistrictsData = await axios.get('https://www.ubos.org/wp-content/uploads/statistics/Districts_in_Uganda_by_number_of_Counties_Constituencies_Sub-Counties_Parishes_and_LC1s.csv');
    const { data } = downloadedDistrictsData;
    const convertDataToArray = splitEasy(data);
    convertDataToArray.map((districtArray) => {
      if(districtArray.includes('Central')
        ||districtArray.includes('Eastern')
        ||districtArray.includes('Western')
        ||districtArray.includes('North')){
          region = districtArray[1];
          districtArray.length = 0;
      }
      if(districtArray.includes('Sub Total') || districtArray.includes('Grand Total')
        || districtArray.includes('Districts in Uganda by number of Counties_Constituencies_Sub-Counties_Parishes and LC1s')
        || districtArray.includes('District Code')){
          districtArray.length = 0;
      }
      if(districtArray.length === 0){
        districtArray = null;
      }
      if(districtArray !== null){
        districtArray.splice(8, 12);

        const jsonDistricts = {
          districtCode: districtArray[0],
          districtName: districtArray[1],
          population: districtArray[2],
          counties: districtArray[3],
          contituenceies: districtArray[4],
          subCounties: districtArray[5],
          parishes: districtArray[6],
          villages: districtArray[7],
          region: region
        }
        result.push(jsonDistricts);
      }
    })
    return { status: 200, data: result };
  } catch (error) {
    return error;
  }
};
