let getTimestamp;
if (typeof performance !== 'undefined' &&
    typeof performance.now === 'function' &&
    isFinite(performance.now())) {
    getTimestamp = () => performance.now();
}
else {
    getTimestamp = () => Date.now();
}
export default getTimestamp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0VGltZXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL0dldFRpbWVzdGFtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFlBQTBCLENBQUE7QUFFOUIsSUFDRSxPQUFPLFdBQVcsS0FBSyxXQUFXO0lBQ2xDLE9BQU8sV0FBVyxDQUFDLEdBQUcsS0FBSyxVQUFVO0lBQ3JDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsRUFDM0IsQ0FBQztJQUNELFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDeEMsQ0FBQztLQUFNLENBQUM7SUFDTixZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ2pDLENBQUM7QUFFRCxlQUFlLFlBQVksQ0FBQSJ9