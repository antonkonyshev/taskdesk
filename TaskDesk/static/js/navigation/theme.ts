

export const darkThemeInit = (): boolean => {
    try {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
    } catch(err) {
        return false
    }
}

export const applyThemeVariant = (darkTheme: boolean) => {
    if (darkTheme) {
        document.documentElement.classList.add("dark")
    } else if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark")
    }
}