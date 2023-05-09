from pywinauto import Application, Desktop
import time

# Define the path to the Teamspeak 3 client executable
ts3_exe_path = "C:\\Program Files\\TeamSpeak 3 Client\\ts3client_win64.exe"

# Define the delay between channel switches (in seconds)
channel_switch_delay = 1

# Start the Teamspeak 3 client and wait for it to start up
# app = Application().start(ts3_exe_path)
# time.sleep(5)

# Attach to the Teamspeak 3 client process
app = Application(backend="uia").connect(path=ts3_exe_path)

# Get the main window
main_window = app.window(title_re="TeamSpeak 3")

print ('here')
print(main_window)
for c in main_window.children():
    print(c)
# Get the channel tree view control
channel_tree_view = main_window.child_window(title="Channel Tree View", control_type="Tree")

# Get the root node of the channel tree
root_node = channel_tree_view.tree_root()

# Select the root node to show its children
root_node.select()

custom_control = root_node.child_window( control_type="Custom", found_index=0, class_name="UIAWrapper")
custom_control_info = custom_control.element_info
custom_control_text = custom_control_info.get("Name", "")

print(custom_control_text)

# Loop through the child nodes of the root node and print their names
for child_node in root_node.children():
    print(f"Current channel: {child_node.texts()[0]}")
    # Wait for the channel to be loaded
    time.sleep(channel_switch_delay)

    # Select the child node to show its children
    child_node.select()

    # Loop through the child nodes of the current channel and print their names
    for grandchild_node in child_node.children():
        print(f"Current channel: {grandchild_node.texts()[0]}")

        # Wait for the channel to be loaded
        time.sleep(channel_switch_delay)

        # Select the grandchild node to show its children
        grandchild_node.select()

        # Loop through the child nodes of the current channel and print their names
        for great_grandchild_node in grandchild_node.children():
            print(f"Current channel: {great_grandchild_node.texts()[0]}")

            # Wait for the channel to be loaded
            time.sleep(channel_switch_delay)

            # Select the great-grandchild node to show its children
            great_grandchild_node.select()

            # Loop through the child nodes of the current channel and print their names
            for great_great_grandchild_node in great_grandchild_node.children():
                print(f"Current channel: {great_great_grandchild_node.texts()[0]}")

                # Wait for the channel to be loaded
                time.sleep(channel_switch_delay)

                # Select the great-great-grandchild node to show its children
                great_great_grandchild_node.select()

                # Loop through the child nodes of the current channel and print their names
                for great_great_great_grandchild_node in great_great_grandchild_node.children():
                    print(f"Current channel: {great_great_great_grandchild_node.texts()[0]}")

                    # Wait for the channel to be loaded
                    time.sleep(channel_switch_delay)

                    # Select the great-great-great-grandchild node to show its children
                    great_great_great_grandchild_node.select()

                    # Loop through the child nodes of the current channel and print their names
                    for great_great_great_great_grandchild_node in great_great_great_grandchild_node.children():
                        print( "element")
