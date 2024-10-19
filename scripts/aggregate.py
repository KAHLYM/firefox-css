import glob
import tinycss2
import json
import os

GECKO_DEV = "C:/git/gecko-dev"


def get_completions(source: str):
    completions = []
    for file in glob.glob(f"{GECKO_DEV}/{source}/**/*.css"):
        with open(file) as f:
            rules = tinycss2.parse_stylesheet(
                f.read(), skip_comments=True, skip_whitespace=True
            )

            for rule in rules:

                if (
                    rule.prelude is None
                    or rule.content is None
                    or any(
                        isinstance(
                            element,
                            (
                                tinycss2.ast.CurlyBracketsBlock,
                                tinycss2.ast.FunctionBlock,
                                tinycss2.ast.SquareBracketsBlock,
                            ),
                        )
                        for element in (rule.prelude + rule.content)
                    )
                ):
                    continue

                prelude = "".join([element.value for element in rule.prelude])
                content = "".join([str(element.value) for element in rule.content])

                completions.append(
                    {"label": prelude, "snippet": f"{prelude}{{{content}}}"}
                )

    return completions


sources = [
    "browser/themes/linux",
    "browser/themes/osx",
    "browser/themes/shared",
    "browser/themes/windows",
]

completions = {}
for source in sources:
    completions[os.path.basename(source)] = get_completions(source)

with open("./completions.json", "w") as f:
    json.dump({"completions": completions}, f)
