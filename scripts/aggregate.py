import glob
import tinycss2
import json
import os
import argparse

parser = argparse.ArgumentParser("Aggregate")
parser.add_argument(
    "--path",
    help="Path to gecko-dev repository",
    type=str,
    nargs="?",
    default="C:/git/gecko-dev",
)
args = parser.parse_args()


def expand_values(components) -> str:
    value = ""

    for component in components:

        if isinstance(component, tinycss2.ast.FunctionBlock):
            value += f"{component.name}({expand_values(component.arguments)})"
        elif isinstance(component, tinycss2.ast.CurlyBracketsBlock):
            value += f"{{{expand_values(component.content)}}}"
        elif isinstance(component, tinycss2.ast.SquareBracketsBlock):
            value += f"[{expand_values(component.content)}]"
        elif isinstance(component, tinycss2.ast.ParenthesesBlock):
            value += f"({expand_values(component.content)})"
        else:
            value += str(component.value)

    return value


def get_completions(source: str):
    completions = []
    for file in glob.glob(f"{args.path}/{source}/**/*.css"):
        with open(file) as f:
            rules = tinycss2.parse_stylesheet(
                f.read(), skip_comments=True, skip_whitespace=True
            )

            for rule in rules:

                prelude = expand_values(rule.prelude) if rule.prelude else ""
                content = expand_values(rule.content) if rule.content else ""

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
