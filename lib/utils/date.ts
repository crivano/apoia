export function parseDateDDMMYYYY(dateString: string): Date | null {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return null
    }

    const parts = dateString.split('/')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)

    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
        return null
    }

    const date = new Date(year, month - 1, day)
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
        return date
    }

    return null
}

export function formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

export function dateAddMonths(date: string | Date, months: number): Date | null {
    let initialDate: Date | null

    if (typeof date === 'string') {
        initialDate = parseDateDDMMYYYY(date)
    } else {
        initialDate = date
    }

    if (!initialDate) {
        return null
    }

    const newDate = new Date(initialDate)
    const originalDay = newDate.getDate()
    newDate.setMonth(newDate.getMonth() + months)

    // If the new month has fewer days than the original month's day,
    // the date will roll over. Correct this by setting it to the last day of the target month.
    if (newDate.getDate() !== originalDay) {
        newDate.setDate(0)
    }

    return newDate
}

export function dateAddDays(date: string | Date, days: number): Date | null {
    let initialDate: Date | null

    if (typeof date === 'string') {
        initialDate = parseDateDDMMYYYY(date)
    } else {
        initialDate = date
    }

    if (!initialDate) {
        return null
    }

    const newDate = new Date(initialDate)
    newDate.setDate(newDate.getDate() + days)
    return newDate
}