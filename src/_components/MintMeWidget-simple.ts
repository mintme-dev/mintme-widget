export class MintMeWidget extends HTMLElement {
  constructor() {
    console.log("🏗️ Simple constructor called");
    super();
    console.log("✅ Simple constructor completed");
  }

  connectedCallback() {
    console.log("🔗 Simple connectedCallback called");
    this.innerHTML = `
		<div style="padding: 20px; border: 1px solid #ccc;">
		  <h2>Simple MintMe Widget</h2>
		  <p>If you see this, the basic Web Component works!</p>
		</div>
	  `;
    console.log("✅ Simple connectedCallback completed");
  }
}
