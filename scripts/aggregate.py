import argparse
import collections
import json
import os
import tinycss2

parser = argparse.ArgumentParser("Aggregate")
parser.add_argument(
    "--input",
    help="Path to gecko-dev repository",
    type=str,
    nargs="?",
    default="C:/git/gecko-dev",
)
parser.add_argument("--output", help="Path to write completions", type=str)
args = parser.parse_args()


def expand_values(components) -> str:
    value = ""

    for component in components:

        if isinstance(component, tinycss2.ast.Comment):
            value += f"/*{component.value}*/"
        elif isinstance(component, tinycss2.ast.CurlyBracketsBlock):
            value += f"{{{expand_values(component.content)}}}"
        elif isinstance(component, tinycss2.ast.FunctionBlock):
            value += f"{component.name}({expand_values(component.arguments)})"
        elif isinstance(component, tinycss2.ast.SquareBracketsBlock):
            value += f"[{expand_values(component.content)}]"
        elif isinstance(component, tinycss2.ast.ParenthesesBlock):
            value += f"({expand_values(component.content)})"
        else:
            value += str(component.value)

    return value


def get_completions(source: str):
    completions = []

    with open(source) as f:
        rules = tinycss2.parse_stylesheet(f.read(), skip_whitespace=True)

        for rule in rules:

            # No interest in comments that are not within rule
            if isinstance(rule, tinycss2.ast.Comment):
                continue

            prelude = expand_values(rule.prelude) if rule.prelude else ""
            content = expand_values(rule.content) if rule.content else ""

            completions.append(
                {
                    "label": prelude,
                    "snippet": f"{prelude}{{{content}}}",
                    "source": source.replace("\\", "/").removeprefix(f"{args.input}/"),
                }
            )

    return completions


completions = collections.defaultdict(list)
for root, dirs, files in os.walk(os.path.join(args.input, "browser")):
    for file in files:
        if file.endswith(".css"):
            source = os.path.join(root, file)
            dir = os.path.basename(root)
            key = dir if dir in ["linux", "osx", "windows"] else "shared"
            completions[key].extend(get_completions(source))

os.makedirs("./completions", exist_ok=True)
with open("./completions/master.json", "w") as f:
    json.dump({"completions": completions}, f)
