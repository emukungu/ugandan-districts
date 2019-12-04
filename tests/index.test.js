import moxios from 'moxios';
import districts from '../src/index';

describe('Test the module', () => {
  
  beforeEach( async () => {
    moxios.install();
    const url = 'https://www.ubos.org/wp-content/uploads/statistics/Districts_in_Uganda_by_number_of_Counties_Constituencies_Sub-Counties_Parishes_and_LC1s.csv';
    moxios.stubRequest(url, {
      status: 200,
      response: '119,Butambala,"102,800",1,1,6,25,140,,,,,,,,,,,,'
    });
  })
  afterEach(() => {
    moxios.uninstall();
  });
  it('should return all the districts from the cache', async () => {
    const res = await districts();
    expect(res.status).toEqual(200);
  });
})
