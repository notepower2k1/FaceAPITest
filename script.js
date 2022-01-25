const container = document.querySelector("#container");
const fileInput = document.querySelector("#file-input");

async function loadTrainingData(){
    const labels = ['Chou Tzuyu','Hirai Momo','Im Nayeon','Kim Dahyun','Minatozaki Sana','Myoui Mina','Park Jihyo','Yoo Jeongyeon','Son Chaeyoung']

  
	const faceDescriptors = []
	for (const label of labels) {
		const descriptors = []
		for (let i = 0; i <= 27; i++) {
			const image = await faceapi.fetchImage(`/data/${label}/${i}.jpg`)
			const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
			descriptors.push(detection.descriptor)
		}
		faceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptors))
		Toastify({
			text: `Trained ${label}'s data!`
		}).showToast();
	}

	return faceDescriptors
}


let faceMatcher
async function init() {
	await Promise.all([
		faceapi.loadSsdMobilenetv1Model('/models'),
		faceapi.loadFaceRecognitionModel('/models'),
		faceapi.loadFaceLandmarkModel('/models'),
	])


	Toastify({
		text: "Loading data successfully!",
	}).showToast();

	const trainingData = await loadTrainingData()
	faceMatcher = new faceapi.FaceMatcher(trainingData, 0.7)
    
    document.querySelector('.container-loading').style.display = 'none';
    document.querySelector('#wrapper').style.display = 'block';
}

init()

fileInput.addEventListener('change', async (e) => {
    const file = fileInput.files[0];

    //tao anh
    const image = await faceapi.bufferToImage(file);

    //tao canvas vẽ trên ảnh
    const canvas = faceapi.createCanvasFromMedia(image);

    container.innerHTML = '';
    container.append(image);
    container.append(canvas);

    const size = {
        width: image.width,
        height: image.height
    }

    //gán size canvas bằng ảnh
    faceapi.matchDimensions(canvas, size);
    //nhận diện khuôn mặt
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    //resize khung nhận diện
    const resizedDetections = faceapi.resizeResults(detections, size);

    //định dạng tên khuôn mặt
    for (const detection of resizedDetections) {
		const drawBox = new faceapi.draw.DrawBox(detection.detection.box, {
			label: faceMatcher.findBestMatch(detection.descriptor).toString()
		})
		drawBox.draw(canvas)
	}
   
})