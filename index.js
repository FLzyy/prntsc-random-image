import puppeteer from "puppeteer";
import * as fs from "fs/promises";
import inquirer from "inquirer";
import {readChunk} from 'read-chunk';
import imageType from 'image-type';

console.log("I AM NOT RESPONSIBLE IF YOU GET IP BANNED FROM PRNT.SC OR IMGUR USE A VPN OR SOMETHING (THE MORE FILES YOU GET AT ONCE WILL INCREASE THE CHANCES OF YOU GETTING IP BANNED)")
inquirer
	.prompt([
		{
			type: "list",
			message: "Choose Saving Method",
			choices: ["Save to Imgur Gallery", "Save to Output Directory"],
			name: "savingmethod",
		},
		{
			type: "number",
			name: "amount",
			message: "Amount of Images",
			filter(val) {
				return Math.floor(val);
			},
		},
	])
	.then(async (answers) => {
		let files = [];

		for (let i = 1; i <= answers.amount; i++) {
			var directory = "";
			if (answers.savingmethod === "Save to Imgur Gallery") {
				directory = "./temp/";
			} else {
				directory = "./out/";
			}
			files.push(`${directory}image-${i}`);
			const imageFromLink = await getImageFromLink(directory, `image-${i}`);
			const buffer = await readChunk(imageFromLink, {length: 100});
			const type = await imageType(buffer);

			if (type.ext === undefined) {
				await fs.rm(imageFromLink)
				i -= 1;
			} else {
				await fs.rename(imageFromLink, `${imageFromLink}.${type.ext}`)
			}

		}

		if (answers.savingmethod === "Save to Imgur Gallery") {
			console.log(`Imgur Gallery: ${await uploadToImgur(files)}`);
			console.log("Clearing temp files...");
			for (let i = 0; i <= files.length; i++) {
				await fs.rm(files[i]);
			}
		} else {
			console.log("Saved your files to ./out/");
		}
	})
	.catch(async (error) => {
		if (error.isTtyError) {
			console.error("Options could not be rendered, using defaults...");
			let files = [];

			for (let i = 1; i <= 10; i++) {
				files.push(`./temp/image-${i}`);
				await getImageFromLink("./temp/", `image-${i}.png`);
			}

			console.log(`Imgur Gallery: ${await uploadToImgur(files)}`);
			console.log("Clearing temp files...");
			for (let i = 0; i <= files.length; i++) {
				await fs.rm(files[i]);
			}
		} else {
			console.error(error);
			return;
		}
	});

	
// HELPER FUNCTIONS

const randomNumber = (min, max) => {
	return Math.floor(Math.random() * (max - min) + min);
};

const generateLink = async () => {
	// rome-ignore format: Don't extend vertically
	const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
	const letter1 = letters[Math.floor(Math.random() * letters.length)];
	const letter2 = letters[Math.floor(Math.random() * letters.length)];
	const numbers = randomNumber(1111, 9999);
	const link = `https://prnt.sc/${letter1}${letter2}${numbers.toString()}`;

	return link;
};

const getImageFromLink = async (Directory, fileName) => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(200000);
	await page.goto(await generateLink());

	const img = await page.$("#screenshot-image");
	let imgSrc = await page.$eval("img", (img) => img.getAttribute("src"));
	var viewSource = await page.goto(imgSrc);
	fs.writeFile(Directory + fileName, await viewSource.buffer(), function (err) {
		if (err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	});

	browser.close();
	return Directory + fileName;
};

const uploadToImgur = async (files) => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto("https://imgur.com/upload/", { waitUntil: "networkidle0" });

	const [fileChooser] = await Promise.all([
		page.waitForFileChooser(),
		page.click(".PopUpActions-filePicker"),
	]);
	await fileChooser.accept(files);

	page.waitForSelector(".TosConfirmationDialog-confirm--do");
	await Promise.all([
		page.waitForNavigation(),
		page.evaluate(() => {
			document.querySelector(".TosConfirmationDialog-confirm--do").click();
		}),
	]);
	const urlLink = page.url();

	browser.close();
	return urlLink;
};
