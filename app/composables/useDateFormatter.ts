export const useDateFormatter = () => {
	const formatDate = (dateString: Date, locale = "en-US") => {
		const date = new Date(dateString);
		const formatter = new Intl.DateTimeFormat(locale, {
			year: "numeric",
			month: "long",
		});
		return formatter.format(date);
	};

	const diff_hours = (dt1: Date, dt2: Date) => {
		const diffTime = Math.abs(dt2 - dt1);
		const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
		return diffHours;
	};

	const diff_days = (dt1: Date, dt2: Date) => {
		const diffTime = Math.abs(dt2 - dt1);
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const timeSincePosted = (dateString: Date, locale = "en-US") => {
		const dt1 = new Date();
		const dt2 = new Date(dateString);

		const hours = diff_hours(dt1, dt2);
		const days = diff_days(dt1, dt2);

		if (days > 0) {
			return `${days} days ago`;
		} else if (hours > 0) {
			return `${hours} hours ago`;
		} else {
			const minutes = Math.floor((dt1 - dt2) / (1000 * 60));
			return `${minutes} minutes ago`;
		}
	};

	return {
		formatDate,
		timeSincePosted,
	};
};
