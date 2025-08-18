import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";

import { setCommonHeaders } from "@/app/headers";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { NewPost } from "@/app/pages/NewPost";
import { ViewPost } from "@/app/pages/ViewPost";

export type AppContext = {};

export default defineApp([
	setCommonHeaders(),
	// ({ ctx }) => {
	//   // setup ctx here
	//   ctx;
	// },
	render(Document, [
		route("/", Home),
		route("/new", NewPost),
		route("/:user/:slug", ViewPost),
	]),
]);
