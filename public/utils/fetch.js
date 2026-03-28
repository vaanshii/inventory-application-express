document.addEventListener("DOMContentLoaded", () => {
	const saveBtn = document.getElementById("firearm-submit-btn");
	const deleteBtn = document.getElementById("firearm-delete-btn");

	if (saveBtn) {
		saveBtn.addEventListener("click", () => {
			const firearmId = saveBtn.getAttribute("data-id");
			updateFirearm(firearmId);
		});
	}

	if (deleteBtn) {
		deleteBtn.addEventListener("click", () => {
			const firearmId = deleteBtn.getAttribute("data-id");
			deleteFirearm(firearmId);
		});
	}
});

async function updateFirearm(firearmId) {
	const gunData = {
		modelName: document.getElementById("modelName").value,
		category: document.getElementById("category").value,
		serialNumber: document.getElementById("serialNumber").value,
		ammoType: document.getElementById("ammoType").value,
		caliberName: document.getElementById("caliberName").value,
		manufacturerName: document.getElementById("manufacturerName").value,
		country: document.getElementById("country").value,
		purchasePrice: document.getElementById("purchasePrice").value || null,
		purchaseDate: document.getElementById("purchaseDate").value,
		imagePath: document.getElementById("imagePath").value || null,
	};

	try {
		const response = await fetch(`/firearm/update/${firearmId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(gunData),
		});

		const result = await response.json();

		if (response.ok) {
			console.log(`[updateFirearm] Success: ${result.message}`);
			window.location.href = `/firearm/${firearmId}`;
		} else {
			console.log(`[updateFirearm] Error: ${result.error}`);
			setTimeout(() => {
				const event = new CustomEvent("show-validation-errors", {
					detail: result.errors,
				});
				window.dispatchEvent(event);
			}, 0);
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}
}

async function deleteFirearm(firearmId) {
	const confirmed = confirm("Delete this firearm?");

	if (!confirmed) return;

	try {
		const response = await fetch(`/firearm/delete/${firearmId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (response.ok) {
			console.log("[deleteFirearm]: Success Deleting Firearm");
			window.location.href = "/";
		} else {
			const result = await response.json();
			console.error(
				`[deleteFirearm] Error: ${result.error || "Could not delete firearm."}`,
			);
		}
	} catch (error) {
		console.error("Delete fetch error:", error);
	}
}

window.updateFirearm = updateFirearm;
window.deleteFirearm = deleteFirearm;
