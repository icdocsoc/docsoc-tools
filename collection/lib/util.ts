export const formatDateDDMMYYYY = (date: Date): string => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    /// @ts-expect-error: It definitely works like this
    const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(date);

    return formattedDate;
};
