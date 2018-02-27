module.exports = (arr, type)=>{
    let positive = [], negative = [];
    for (let i=0; i<arr.length; i++) {
        if (arr[i] >= 0) {
            positive.push(arr[i])
        } else {
            negative.push(arr[i])
        }
    }
    return type ? negative.sort((a,b)=>b-a) : positive.sort((a,b)=>a-b)
}