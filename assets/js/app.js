import { HtmlUtils } from "../lib/mosaic/utils/index.js";
import { Application } from "../lib/mosaic/core/index.js";
import { View } from "../lib/mosaic/core/index.js";
import { ComplexLength } from "../lib/mosaic/layout/index.js";
import { Button, Surface } from "../lib/mosaic/widgets/index.js";
import { Text } from "../lib/mosaic/widgets/index.js";
import { AppBar } from "../lib/mosaic/widgets/index.js";
import { Card } from "../lib/mosaic/widgets/index.js";
import { StrokeStyle, Color, CornerRadius, RectangleShape, StarShape, ShadowStyle } from "../lib/mosaic/drawing/index.js";
import { Theme, ThemeColor } from "../lib/mosaic/resources/index.js";
import { NumberAnimator, AnimationState, Interpolator, BounceInterpolator, DecelerateInterpolator, OvershootInterpolator } from "../lib/mosaic/animation/index.js";

let app, webTheme;

const themes = {
	light: new Theme({
		colors: {
			text: Color.fromHex("#000000d0"),
			background: Color.white,
			backgroundAlt: Color.whiteSmoke,
			primary: Color.royalBlue,
			appBarBackground: "primary",
			cardBackground: "background",
		}
	}),
		
	dark: new Theme({
		colors: {
			text: Color.fromHex("#ffffffd0"),
			background: Color.fromHex("#111"),
			backgroundAlt: Color.fromHex("#222"),
			primary: Color.fromHex("#849fff"),
			appBarBackground: "backgroundAlt",
			cardBackground: "backgroundAlt"
		}
	})
};

function initialize() {
	app = new Application({
		view: new View({
			children: [
				new AppBar(),
	
				new Card({
					id: "card",
					x: 16,
					y: 72,
					width: new ComplexLength(() => app.view.width - 32),
					height: 220,
					focusable: true
				}),
	
				new Text({
					id: "cardText",
					x: 16,
					y: 72,
					width: new ComplexLength(() => app.view.width - 32),
					height: 220,
					padding: 16,
					
					text: "Hello, world! Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas possimus quibusdam magni suscipit incidunt voluptates ut ab doloribus provident illo, perferendis autem eos obcaecati quod! Necessitatibus iusto maiores rem nulla."
				}),
	
				new Button({
					id: "btn1",
					x: 16,
					y: 308,
					width: 94,
					height: 36
				}),
	
				new Button({
					id: "btn2",
					x: 120,
					y: 308,
					width: 96,
					height: 36,
					background: Color.transparent,
					stroke: new StrokeStyle(new ThemeColor("primary", Color.royalBlue), 2),
					shadow: null,
					shape: new RectangleShape(new CornerRadius(0, 16, 0, 16))
				}),
	
				new Surface({
					id: "star1",
					x: 232,
					y: 308,
					width: 36,
					height: 36,
					shape: new StarShape(7),
					background: Color.transparent,
					stroke: new StrokeStyle(new ThemeColor("primary", Color.royalBlue), 2)
				}),
	
				new Surface({
					id: "star2",
					x: 280,
					y: 308,
					width: 36,
					height: 36,
					shape: new StarShape(),
					background: new ThemeColor("primary", Color.royalBlue),
					shadow: new ShadowStyle(0, 2, 4, Color.fromRgb(0, 0, 0, .25))
				})
			]
		})
	});

	webTheme = document.getElementById("theme-tag");
	setTheme(history.state && history.state.theme === "dark" ? themes.dark : themes.light);
	setupBtn1();
	setupBtn2();
	setupStar1();
	setupStar2();
}

function setTheme(theme) {
	app.theme = theme;
	webTheme.content = app.theme.getColor("appBarBackground").toHex();
	history.replaceState({ theme: theme === themes.light ? "light" : "dark" }, "");
}

function setupBtn1() {
	const btn1 = app.findId("btn1");
	
	btn1.onClick.add(() => {
		setTheme(app.theme === themes.light ? themes.dark : themes.light);
		return true;
	});
}

function setupBtn2() {
	const btn2 = app.findId("btn2");
	const y0 = btn2.y;
	const y1 = y0 + btn2.height + 16;

	let forwards = true;

	const animator = new NumberAnimator({
		duration: 450,
		interpolator: new OvershootInterpolator(3),
		callback(y) {
			btn2.y = y;
		}
	});

	btn2.onClick.add(() => {
		if (animator.state === AnimationState.stopped) {
			if (forwards) {
				animator.from = y0;
				animator.to = y1;
			} else {
				animator.from = y1;
				animator.to = y0;
			}
			
			animator.start();
			forwards = !forwards;
		}
	});
}

function setupStar1() {
	const star1 = app.findId("star1");
	
	new NumberAnimator({
		from: star1.y,
		to: star1.y - star1.height,
		duration: 800,
		iterations: Infinity,

		interpolator: new class extends Interpolator {
			interpolate(progress) {
				return -1 * (progress * 2 - 1) ** 2 + 1;
			}
		}(),

		callback(y) {
			star1.y = y;
		}
	}).start();
}

function setupStar2() {
	const star2 = app.findId("star2");
	const y0 = star2.y;
	const y1 = star2.y - 50;

	const jumpAnimator = new NumberAnimator({
		from: y0,
		to: y1,
		duration: 300,
		interpolator: new DecelerateInterpolator(),

		callback(y) {
			star2.y = y;
		},

		endCallback() {
			fallAnimator.start();
		}
	});

	const fallAnimator = new NumberAnimator({
		from: y1,
		to: y0,
		duration: 1200,
		interpolator: new BounceInterpolator(),

		callback(y) {
			star2.y = y;
		},

		endCallback() {
			setTimeout(() => jumpAnimator.start(), 500);
		}
	});

	jumpAnimator.start();
}

HtmlUtils.documentReady().then(initialize);