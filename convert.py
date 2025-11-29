with open("nouns.txt", "r", encoding="utf-8") as file:
    words = [word.strip() for word in file.readlines() if word.strip()]
js_code = f"const dictionary = {words};"
with open("dictionary.js", "w", encoding="utf-8") as js_file:
    js_file.write(js_code)
print("Словарь конвертирован в dictionary.js")