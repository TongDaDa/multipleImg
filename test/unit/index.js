const sort = require('./sort')

test("sort Number",()=>{
    expect(sort([2,5,3,8,1,0,6,4,-1,-5])).toBe([0,1,2,3,4,5,6,8]);
    expect(sort([0,6,4,-1,-5],true)).toBe([-1,-5]);

})