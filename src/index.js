import axios from 'axios';
import redis from 'redis';
import { promisify } from 'util';
import splitEasy from 'csv-split-easy';

const client = redis.createClient(6379);
client.on('error', (err) => {
  console.log(err.message);
});

const redisdb = {
  setex: promisify(client.setex).bind(client),
  get: promisify(client.get).bind(client)
};

const getDistictsFromUrl = async(districtsKey) => {
  try {
    let region;
    const result = [];
    const downloadedDistrictsData = await axios.get("https://www.ubos.org/wp-content/uploads/statistics/Districts_in_Uganda_by_number_of_Counties_Constituencies_Sub-Counties_Parishes_and_LC1s.csv");
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
    await redisdb.setex(districtsKey, 3600, JSON.stringify(result));
    return { source: 'api', data: result };
  } catch (error) {
    return error;
  }
};

module.exports = async () => {
  const districtsKey = 'user';
  
  try{
    const cachedData = await redisdb.get(districtsKey);
    if(cachedData !== null ) {
      return { source: 'cache', data: JSON.parse(cachedData) };
    }
    return getDistictsFromUrl(districtsKey);
  } catch(err){ return err; }
};
